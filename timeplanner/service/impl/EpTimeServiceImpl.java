package com.skapp.enterprise.timeplanner.service.impl;

import com.skapp.community.common.mapper.CommonMapper;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.timeplanner.model.WorkLocationGeofence;
import com.skapp.enterprise.timeplanner.repository.WorkLocationGeofenceDao;
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
import com.skapp.community.timeplanner.payload.response.TimeRecordChipResponseDto;
import com.skapp.community.timeplanner.repository.projection.EmployeeTimeRecord;
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
import com.skapp.enterprise.timeplanner.payload.response.EpTimeRecordChipResponseDto;
import com.skapp.enterprise.timeplanner.repository.TimeRecordLocationDao;
import com.skapp.enterprise.timeplanner.repository.impl.EpTimeRecordRepositoryImpl;
import com.skapp.enterprise.timeplanner.repository.projection.EpEmployeeTimeRecord;
import com.skapp.enterprise.timeplanner.service.EpTimeService;
import com.skapp.enterprise.timeplanner.type.RecordLocationStatus;
import com.skapp.enterprise.timeplanner.util.GeoFenceUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Primary
@Service
@Slf4j
public class EpTimeServiceImpl extends TimeServiceImpl implements EpTimeService {

	private final EpLeaveCalendarService epLeaveCalendarService;

	private final WorkLocationGeofenceDao workLocationGeofenceDao;

	private final TimeRecordLocationDao timeRecordLocationDao;

	private final EpTimeRecordRepositoryImpl epTimeRecordRepository;

	public EpTimeServiceImpl(TimeConfigDao timeConfigDao, JsonMapper mapper, MessageUtil messageUtil,
			UserService userService, TimeRecordDao timeRecordDao, TimeSlotDao timeSlotDao,
			AttendanceConfigService attendanceConfigService, LeaveRequestDao leaveRequestDao, HolidayDao holidayDao,
			EmployeeDao employeeDao, PeopleMapper peopleMapper, LeaveMapper leaveMapper, TimeRequestDao timeRequestDao,
			TeamDao teamDao, TimeMapper timeMapper, CommonMapper commonMapper, TimeEmailService timeEmailService,
			PageTransformer pageTransformer, EmployeeManagerDao employeeManagerDao,
			AttendanceNotificationService attendanceNotificationService,
			LeaveRequestEntitlementDao leaveRequestEntitlementDao, LeaveEntitlementDao leaveEntitlementDao,
			OrganizationService organizationService, EpLeaveCalendarService epLeaveCalendarService,
			WorkLocationGeofenceDao workLocationGeofenceDao, TimeRecordLocationDao timeRecordLocationDao,
			EpTimeRecordRepositoryImpl epTimeRecordRepository) {
		super(timeConfigDao, mapper, messageUtil, userService, timeRecordDao, timeSlotDao, attendanceConfigService,
				leaveRequestDao, holidayDao, employeeDao, peopleMapper, leaveMapper, timeRequestDao, teamDao,
				timeMapper, commonMapper, timeEmailService, pageTransformer, employeeManagerDao,
				attendanceNotificationService, leaveRequestEntitlementDao, leaveEntitlementDao, organizationService);
		this.epLeaveCalendarService = epLeaveCalendarService;
		this.workLocationGeofenceDao = workLocationGeofenceDao;
		this.timeRecordLocationDao = timeRecordLocationDao;
		this.epTimeRecordRepository = epTimeRecordRepository;
	}

	@Override
	protected void handleCalendarEventsDeletion(LeaveRequest leaveRequest) {
		if (leaveRequest != null && (leaveRequest.getStatus().equals(LeaveRequestStatus.DENIED)
				|| leaveRequest.getStatus().equals(LeaveRequestStatus.REVOKED)
				|| leaveRequest.getStatus().equals(LeaveRequestStatus.CANCELLED))) {
			epLeaveCalendarService.deleteOutOfOfficeEventsForLeave(leaveRequest);
		}
	}

	@Override
	protected TimeRecordChipResponseDto createTimeRecordChipDto() {
		return new EpTimeRecordChipResponseDto();
	}

	@Override
	protected boolean isGeoFencingEnabled() {
		return attendanceConfigService.getAttendanceConfigByType(AttendanceConfigType.GEO_FENCING_ENABLED);
	}

	@Override
	protected void populateEnterpriseChipFields(TimeRecordChipResponseDto chip, EmployeeTimeRecord employeeTimeRecord,
			boolean isGeoFencingEnabled) {
		if (!isGeoFencingEnabled) {
			return;
		}

		if (chip instanceof EpTimeRecordChipResponseDto epChip
				&& employeeTimeRecord instanceof EpEmployeeTimeRecord epRecord) {
			epChip.setClockInLocationStatus(epRecord.getClockInLocationStatus());
			epChip.setClockOutLocationStatus(epRecord.getClockOutLocationStatus());
		}
	}

	@Override
	protected List<EmployeeTimeRecord> findEmployeesTimeRecordsWithTeams(List<Long> employeeIds, List<Long> teamIds,
			LocalDate startDate, LocalDate endDate, int limit, long offset) {
		return epTimeRecordRepository.findEmployeesTimeRecordsWithTeams(employeeIds, teamIds, startDate, endDate, limit,
				offset);
	}

	@Override
	@Transactional
	public ResponseEntityDto addTimeRecordWithLocation(EpAddTimeRecordDto epAddTimeRecordDto) {
		log.info("addTimeRecordWithLocation: execution started");
		User currentUser = userService.getCurrentUser();
		Employee employee = currentUser.getEmployee();

		boolean isGeoFencingEnabled = attendanceConfigService
			.getAttendanceConfigByType(AttendanceConfigType.GEO_FENCING_ENABLED);

		if (!isGeoFencingEnabled) {
			throw new ModuleException(EpTimeMessageConstant.EP_TIME_ERROR_GEO_FENCING_NOT_ENABLED);
		}

		addTimeRecord(epAddTimeRecordDto);

		if (employee.getWorkLocation() == null) {
			log.warn("addTimeRecordWithLocation: employee {} has no assigned work location", employee.getEmployeeId());
			return new ResponseEntityDto(false, null);
		}

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
			.orElseThrow(() -> new ModuleException(EpTimeMessageConstant.EP_TIME_ERROR_TIME_RECORD_NOT_FOUND));

		saveLocationStatus(timeRecord, epAddTimeRecordDto.getRecordActionType(), locationStatus);

		return new ResponseEntityDto(false, locationStatus);
	}

	private boolean determineIfWithinGeofence(Employee employee, double userLat, double userLon) {
		Optional<WorkLocationGeofence> geofence = workLocationGeofenceDao
			.findByWorkLocationWorkLocationId(employee.getWorkLocation().getWorkLocationId());

		if (geofence.isEmpty()) {
			return false;
		}

		WorkLocationGeofence fence = geofence.get();
		double fenceLat = Double.parseDouble(fence.getLatitude());
		double fenceLon = Double.parseDouble(fence.getLongitude());

		return GeoFenceUtils.isWithinGeofence(userLat, userLon, fenceLat, fenceLon, fence.getRadiusMeters());
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
