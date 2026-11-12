package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.leaveplanner.constant.PolicyLeaveConstant;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestDao;
import com.skapp.community.leaveplanner.service.PolicyHolidayLeaveEmailService;
import com.skapp.community.leaveplanner.service.PolicyHolidayLeaveNotificationService;
import com.skapp.community.leaveplanner.service.PolicyHolidayLeaveService;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class PolicyHolidayLeaveServiceImpl implements PolicyHolidayLeaveService {

	private static final float FULL_DAY = 1f;

	private static final float HALF_DAY = 0.5f;

	private final PolicyLeaveRequestDao policyLeaveRequestDao;

	private final HolidayDao holidayDao;

	private final TimeConfigDao timeConfigDao;

	private final PolicyHolidayLeaveEmailService policyHolidayLeaveEmailService;

	private final PolicyHolidayLeaveNotificationService policyHolidayLeaveNotificationService;

	@Override
	@Transactional
	public void adjustLeaveRequestsForHoliday(Holiday holiday) {
		log.info("adjustLeaveRequestsForHoliday: execution started");

		LocalDate holidayDate = holiday.getDate();
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		if (!timeConfigs.isEmpty() && !CommonModuleUtils.checkIfDayIsWorkingDay(holidayDate, timeConfigs)) {
			return;
		}

		List<Holiday> otherHolidaysOnDate = holidayDao.findAllByIsActiveTrueAndDate(holidayDate)
			.stream()
			.filter(existing -> !Objects.equals(existing.getId(), holiday.getId()))
			.toList();

		List<PolicyLeaveRequest> updatedRequests = new ArrayList<>();
		policyLeaveRequestDao.findUpcomingRequests(PolicyLeaveConstant.ATTENDANCE_LEAVE_STATUSES, holidayDate)
			.stream()
			.filter(request -> !request.getStartDate().isAfter(holidayDate))
			.filter(request -> appliesToEmployee(holiday, request.getEmployee()))
			.filter(request -> !isDateAlreadyCovered(holiday, otherHolidaysOnDate, request.getEmployee()))
			.forEach(request -> {
				if (adjustLeaveRequest(request, holiday)) {
					updatedRequests.add(request);
				}
			});

		if (!updatedRequests.isEmpty()) {
			policyLeaveRequestDao.saveAll(updatedRequests);
		}

		log.info("adjustLeaveRequestsForHoliday: execution ended with {} request(s)", updatedRequests.size());
	}

	private boolean adjustLeaveRequest(PolicyLeaveRequest request, Holiday holiday) {
		boolean isFullDayHoliday = holiday.getHolidayDuration() == HolidayDuration.FULL_DAY;
		LeaveRequestStatus originalStatus = request.getStatus();

		if (request.getStartDate().equals(request.getEndDate())) {
			if (isHalfDay(request.getLeaveState())) {
				if (!isFullDayHoliday && !isSameHalf(holiday.getHolidayDuration(), request.getLeaveState())) {
					return false;
				}
				voidLeaveRequest(request, holiday, originalStatus);
				return true;
			}

			if (isFullDayHoliday) {
				voidLeaveRequest(request, holiday, originalStatus);
				return true;
			}

			request.setLeaveState(holiday.getHolidayDuration() == HolidayDuration.HALF_DAY_MORNING
					? LeaveState.HALFDAY_EVENING : LeaveState.HALFDAY_MORNING);
			request.setDurationDays(HALF_DAY);
			sendUpdated(request, holiday);
			return true;
		}

		float revisedDuration = request.getDurationDays() - (isFullDayHoliday ? FULL_DAY : HALF_DAY);
		if (revisedDuration <= 0f) {
			voidLeaveRequest(request, holiday, originalStatus);
			return true;
		}

		request.setDurationDays(revisedDuration);
		sendUpdated(request, holiday);
		return true;
	}

	private void voidLeaveRequest(PolicyLeaveRequest request, Holiday holiday, LeaveRequestStatus originalStatus) {
		request.setStatus(originalStatus == LeaveRequestStatus.PENDING ? LeaveRequestStatus.CANCELLED
				: LeaveRequestStatus.REVOKED);

		policyHolidayLeaveEmailService.sendHolidayLeaveRequestVoidedEmails(request, holiday, originalStatus);
		policyHolidayLeaveNotificationService.sendHolidayLeaveRequestVoidedNotifications(request, holiday,
				originalStatus);
	}

	private void sendUpdated(PolicyLeaveRequest request, Holiday holiday) {
		policyHolidayLeaveEmailService.sendHolidayLeaveRequestUpdatedEmails(request, holiday);
		policyHolidayLeaveNotificationService.sendHolidayLeaveRequestUpdatedNotifications(request, holiday);
	}

	private boolean isDateAlreadyCovered(Holiday holiday, List<Holiday> otherHolidaysOnDate, Employee employee) {
		return otherHolidaysOnDate.stream()
			.filter(existing -> appliesToEmployee(existing, employee))
			.map(Holiday::getHolidayDuration)
			.anyMatch(duration -> duration == HolidayDuration.FULL_DAY || duration == holiday.getHolidayDuration());
	}

	private boolean appliesToEmployee(Holiday holiday, Employee employee) {
		Set<WorkLocation> workLocations = holiday.getWorkLocations();
		if (workLocations == null || workLocations.isEmpty()) {
			return true;
		}

		WorkLocation employeeWorkLocation = employee.getWorkLocation();
		if (employeeWorkLocation == null || employeeWorkLocation.getWorkLocationId() == null) {
			return false;
		}

		return workLocations.stream()
			.anyMatch(
					workLocation -> employeeWorkLocation.getWorkLocationId().equals(workLocation.getWorkLocationId()));
	}

	private boolean isHalfDay(LeaveState leaveState) {
		return leaveState == LeaveState.HALFDAY_MORNING || leaveState == LeaveState.HALFDAY_EVENING;
	}

	private boolean isSameHalf(HolidayDuration holidayDuration, LeaveState leaveState) {
		return (holidayDuration == HolidayDuration.HALF_DAY_MORNING && leaveState == LeaveState.HALFDAY_MORNING)
				|| (holidayDuration == HolidayDuration.HALF_DAY_EVENING && leaveState == LeaveState.HALFDAY_EVENING);
	}

}
