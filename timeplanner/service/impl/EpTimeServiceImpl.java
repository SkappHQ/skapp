package com.skapp.enterprise.timeplanner.service.impl;

import com.skapp.community.common.mapper.CommonMapper;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.model.WorkLocationGeofence;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.WorkLocationGeofenceDao;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.repository.LeaveEntitlementDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestEntitlementDao;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.timeplanner.mapper.TimeMapper;
import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import com.skapp.community.timeplanner.repository.TimeRecordDao;
import com.skapp.community.timeplanner.repository.TimeRequestDao;
import com.skapp.community.timeplanner.repository.TimeSlotDao;
import com.skapp.community.timeplanner.service.AttendanceConfigService;
import com.skapp.community.timeplanner.service.AttendanceNotificationService;
import com.skapp.community.timeplanner.service.TimeEmailService;
import com.skapp.community.timeplanner.service.impl.TimeServiceImpl;
import com.skapp.community.timeplanner.type.AttendanceConfigType;
import com.skapp.community.timeplanner.type.TimeRecordActionTypes;
import com.skapp.enterprise.leaveplanner.service.EpLeaveCalendarService;
import com.skapp.enterprise.timeplanner.constant.EpTimeMessageConstant;
import com.skapp.enterprise.timeplanner.model.TimeRecordLocation;
import com.skapp.enterprise.timeplanner.payload.request.EpAddTimeRecordDto;
import com.skapp.enterprise.timeplanner.repository.TimeRecordLocationDao;
import com.skapp.enterprise.timeplanner.type.RecordLocationStatus;
import com.skapp.enterprise.timeplanner.util.GeoFenceUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.util.Optional;

@Primary
@Service
@Slf4j
public class EpTimeServiceImpl extends TimeServiceImpl {

	private final EpLeaveCalendarService epLeaveCalendarService;

	private final UserService userService;

	private final TimeRecordDao timeRecordDao;

	private final WorkLocationGeofenceDao workLocationGeofenceDao;

	private final TimeRecordLocationDao timeRecordLocationDao;

	private final AttendanceConfigService attendanceConfigService;

	public EpTimeServiceImpl(TimeConfigDao timeConfigDao, JsonMapper mapper, MessageUtil messageUtil,
			UserService userService, TimeRecordDao timeRecordDao, TimeSlotDao timeSlotDao,
			AttendanceConfigService attendanceConfigService, LeaveRequestDao leaveRequestDao, HolidayDao holidayDao,
			EmployeeDao employeeDao, PeopleMapper peopleMapper, LeaveMapper leaveMapper, TimeRequestDao timeRequestDao,
			TeamDao teamDao, TimeMapper timeMapper, CommonMapper commonMapper, TimeEmailService timeEmailService,
			PageTransformer pageTransformer, EmployeeManagerDao employeeManagerDao,
			AttendanceNotificationService attendanceNotificationService,
			LeaveRequestEntitlementDao leaveRequestEntitlementDao, LeaveEntitlementDao leaveEntitlementDao,
			OrganizationService organizationService, EpLeaveCalendarService epLeaveCalendarService,
			WorkLocationGeofenceDao workLocationGeofenceDao, TimeRecordLocationDao timeRecordLocationDao) {
		super(timeConfigDao, mapper, messageUtil, userService, timeRecordDao, timeSlotDao, attendanceConfigService,
				leaveRequestDao, holidayDao, employeeDao, peopleMapper, leaveMapper, timeRequestDao, teamDao,
				timeMapper, commonMapper, timeEmailService, pageTransformer, employeeManagerDao,
				attendanceNotificationService, leaveRequestEntitlementDao, leaveEntitlementDao, organizationService);
		this.epLeaveCalendarService = epLeaveCalendarService;
		this.userService = userService;
		this.timeRecordDao = timeRecordDao;
		this.workLocationGeofenceDao = workLocationGeofenceDao;
		this.timeRecordLocationDao = timeRecordLocationDao;
		this.attendanceConfigService = attendanceConfigService;
	}

	@Override
	protected void handleCalendarEventsDeletion(LeaveRequest leaveRequest) {
		if (leaveRequest != null && (leaveRequest.getStatus().equals(LeaveRequestStatus.DENIED)
				|| leaveRequest.getStatus().equals(LeaveRequestStatus.REVOKED)
				|| leaveRequest.getStatus().equals(LeaveRequestStatus.CANCELLED))) {
			epLeaveCalendarService.deleteOutOfOfficeEventsForLeave(leaveRequest);
		}
	}

	@Transactional
	public ResponseEntityDto addTimeRecordWithLocation(EpAddTimeRecordDto epAddTimeRecordDto) {
		User currentUser = userService.getCurrentUser();
		Employee employee = currentUser.getEmployee();
		log.info("addTimeRecordWithLocation: execution started by user: {}", currentUser.getUserId());

		boolean isGeoFencingEnabled = attendanceConfigService
			.getAttendanceConfigByType(AttendanceConfigType.GEO_FENCING_ENABLED);

		if (!isGeoFencingEnabled) {
			throw new ModuleException(EpTimeMessageConstant.EP_TIME_ERROR_GEO_FENCING_NOT_ENABLED);
		}

		ResponseEntityDto response = addTimeRecord(epAddTimeRecordDto);

		RecordLocationStatus locationStatus;
		if (epAddTimeRecordDto.getLatitude() == null || epAddTimeRecordDto.getLongitude() == null) {
			locationStatus = RecordLocationStatus.UNAVAILABLE;
		}
		else {
			boolean isWithinLocation = determineIfWithinGeofence(employee, epAddTimeRecordDto.getLatitude(),
					epAddTimeRecordDto.getLongitude());
			locationStatus = isWithinLocation ? RecordLocationStatus.INSIDE : RecordLocationStatus.OUTSIDE;
		}

		TimeRecord timeRecord = timeRecordDao
			.findByEmployeeAndDate(employee, epAddTimeRecordDto.getTime().toLocalDate())
			.orElse(null);

		if (timeRecord != null) {
			saveLocationStatus(timeRecord, epAddTimeRecordDto.getRecordActionType(), locationStatus);
		}

		return response;
	}

	private boolean determineIfWithinGeofence(Employee employee, double userLat, double userLon) {
		if (employee.getWorkLocation() == null) {
			log.warn("addTimeRecordWithLocation: employee {} has no assigned work location", employee.getEmployeeId());
			return false;
		}

		Optional<WorkLocationGeofence> geofence = workLocationGeofenceDao
			.findByWorkLocationWorkLocationId(employee.getWorkLocation().getWorkLocationId());

		if (geofence.isEmpty()) {
			log.warn("addTimeRecordWithLocation: no geofence configured for work location {}",
					employee.getWorkLocation().getWorkLocationId());
			return false;
		}

		WorkLocationGeofence fence = geofence.get();
		double fenceLat = Double.parseDouble(fence.getLatitude());
		double fenceLon = Double.parseDouble(fence.getLongitude());

		double distance = GeoFenceUtils.calculateHaversineDistance(userLat, userLon, fenceLat, fenceLon);
		return distance <= fence.getRadiusMeters();
	}

	private void saveLocationStatus(TimeRecord timeRecord, TimeRecordActionTypes actionType,
			RecordLocationStatus locationStatus) {
		if (actionType == TimeRecordActionTypes.START) {
			TimeRecordLocation recordLocation = new TimeRecordLocation();
			recordLocation.setTimeRecord(timeRecord);
			recordLocation.setClockInLocationStatus(locationStatus);
			timeRecordLocationDao.save(recordLocation);
		}
		else if (actionType == TimeRecordActionTypes.END) {
			Optional<TimeRecordLocation> existingLocation = timeRecordLocationDao.findByTimeRecord(timeRecord);
			if (existingLocation.isPresent()) {
				existingLocation.get().setClockOutLocationStatus(locationStatus);
				timeRecordLocationDao.save(existingLocation.get());
			}
			else {
				TimeRecordLocation recordLocation = new TimeRecordLocation();
				recordLocation.setTimeRecord(timeRecord);
				recordLocation.setClockOutLocationStatus(locationStatus);
				timeRecordLocationDao.save(recordLocation);
			}
		}
	}

}
