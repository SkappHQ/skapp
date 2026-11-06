package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.constant.PolicyLeaveConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.payload.PolicyLeaveDateWindowDto;
import com.skapp.community.leaveplanner.payload.request.LeaveRequestAvailabilityFilterDto;
import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestDao;
import com.skapp.community.leaveplanner.service.LeavePolicyService;
import com.skapp.community.leaveplanner.service.PolicyAttendanceLeaveEmailService;
import com.skapp.community.leaveplanner.service.PolicyAttendanceLeaveNotificationService;
import com.skapp.community.leaveplanner.service.PolicyAttendanceLeaveService;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.payload.response.ClockInSummaryLeaveRequestResponseDto;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Collection;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PolicyAttendanceLeaveServiceImpl implements PolicyAttendanceLeaveService {

	private final LeavePolicyService leavePolicyService;

	private final PolicyLeaveRequestDao policyLeaveRequestDao;

	private final LeaveMapper leaveMapper;

	private final TimeZoneService timeZoneService;

	private final PolicyAttendanceLeaveEmailService policyAttendanceLeaveEmailService;

	private final PolicyAttendanceLeaveNotificationService policyAttendanceLeaveNotificationService;

	private final UserService userService;

	@Override
	public Boolean isLeavePoliciesEnabled() {
		return leavePolicyService.isLeavePoliciesEnabled();
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getPolicyLeaveDayAvailability(
			@NonNull LeaveRequestAvailabilityFilterDto leaveRequestAvailabilityFilterDto) {
		log.info("getPolicyLeaveDayAvailability: execution started");
		if (!leavePolicyService.isLeavePoliciesEnabled()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_NOT_ENABLED);
		}

		LocalDate date = leaveRequestAvailabilityFilterDto.getDate() != null
				? leaveRequestAvailabilityFilterDto.getDate() : timeZoneService.currentOrganizationDate();
		Long employeeId = userService.getCurrentUser().getEmployee().getEmployeeId();

		List<LeaveRequestResponseDto> leaveRequests = getEmployeeLeaveRequests(employeeId, date, date, false);

		log.info("getPolicyLeaveDayAvailability: execution ended");
		return new ResponseEntityDto(false, leaveRequests);
	}

	@Override
	@Transactional(readOnly = true)
	public List<LeaveRequestResponseDto> getEmployeeLeaveRequests(Long employeeId, LocalDate startDate,
			LocalDate endDate, Boolean activeUsersOnly) {
		log.info("getEmployeeLeaveRequests: execution started");

		List<LeaveRequestResponseDto> leaveRequests = policyLeaveRequestDao
			.findEmployeesRequestsInRange(List.of(employeeId), PolicyLeaveConstant.ATTENDANCE_LEAVE_STATUSES, startDate,
					endDate, activeUsersOnly)
			.stream()
			.map(leaveMapper::policyLeaveRequestToLeaveRequestResponseDto)
			.toList();

		log.info("getEmployeeLeaveRequests: execution ended");
		return leaveRequests;
	}

	@Override
	@Transactional(readOnly = true)
	public Map<Long, List<LeaveRequestResponseDto>> getEmployeesLeaveRequests(Collection<Long> employeeIds,
			LocalDate startDate, LocalDate endDate, Boolean activeUsersOnly) {
		log.info("getEmployeesLeaveRequests: execution started");

		Map<Long, List<LeaveRequestResponseDto>> leaveRequestsByEmployee = groupByEmployee(
				policyLeaveRequestDao.findEmployeesRequestsInRange(employeeIds,
						PolicyLeaveConstant.ATTENDANCE_LEAVE_STATUSES, startDate, endDate, activeUsersOnly));

		log.info("getEmployeesLeaveRequests: execution ended");
		return leaveRequestsByEmployee;
	}

	@Override
	@Transactional(readOnly = true)
	public Map<Long, List<LeaveRequestResponseDto>> getTeamLeaveRequests(Long teamId, LocalDate startDate,
			LocalDate endDate) {
		log.info("getTeamLeaveRequests: execution started");

		Map<Long, List<LeaveRequestResponseDto>> leaveRequestsByEmployee = groupByEmployee(policyLeaveRequestDao
			.findTeamRequestsInRange(teamId, PolicyLeaveConstant.ATTENDANCE_LEAVE_STATUSES, startDate, endDate));

		log.info("getTeamLeaveRequests: execution ended");
		return leaveRequestsByEmployee;
	}

	@Override
	public LeaveRequestResponseDto findLeaveRequestOnDate(
			Map<Long, List<LeaveRequestResponseDto>> leaveRequestsByEmployee, Long employeeId, LocalDate date) {
		if (date == null) {
			return null;
		}

		return leaveRequestsByEmployee.getOrDefault(employeeId, List.of())
			.stream()
			.filter(leaveRequest -> isWithinLeave(leaveRequest, date))
			.findFirst()
			.orElse(null);
	}

	@Override
	public Boolean isOnApprovedLeave(Map<Long, List<LeaveRequestResponseDto>> leaveRequestsByEmployee, Long employeeId,
			LocalDate date) {
		if (date == null) {
			return false;
		}

		return leaveRequestsByEmployee.getOrDefault(employeeId, List.of())
			.stream()
			.anyMatch(leaveRequest -> leaveRequest.getStatus() == LeaveRequestStatus.APPROVED
					&& isWithinLeave(leaveRequest, date));
	}

	@Override
	public ClockInSummaryLeaveRequestResponseDto findClockInSummaryLeaveRequest(
			Map<Long, List<LeaveRequestResponseDto>> leaveRequestsByEmployee, Long employeeId, LocalDate date) {
		LeaveRequestResponseDto leaveRequest = findLeaveRequestOnDate(leaveRequestsByEmployee, employeeId, date);
		return leaveRequest != null
				? leaveMapper.leaveRequestResponseDtoToClockInSummaryLeaveRequestResponseDto(leaveRequest) : null;
	}

	@Override
	@Transactional(readOnly = true)
	public Set<DayOfWeek> getDaysWithUpcomingLeaveRequests() {
		log.info("getDaysWithUpcomingLeaveRequests: execution started");

		LocalDate today = timeZoneService.currentOrganizationDate();
		Set<DayOfWeek> days = EnumSet.noneOf(DayOfWeek.class);

		for (PolicyLeaveDateWindowDto window : policyLeaveRequestDao
			.findUpcomingRequestDateWindows(PolicyLeaveConstant.ATTENDANCE_LEAVE_STATUSES, today)) {
			days.addAll(getUpcomingDays(window.getStartDate(), window.getEndDate(), today));

			if (days.size() == DayOfWeek.values().length) {
				break;
			}
		}

		log.info("getDaysWithUpcomingLeaveRequests: execution ended");
		return days;
	}

	@Override
	@Transactional
	public void voidLeaveRequestsOnRemovedDays(List<TimeConfig> removingConfigs) {
		log.info("voidLeaveRequestsOnRemovedDays: execution started");

		Set<DayOfWeek> removingDays = removingConfigs.stream()
			.map(TimeConfig::getDay)
			.collect(Collectors.toCollection(() -> EnumSet.noneOf(DayOfWeek.class)));
		if (removingDays.isEmpty()) {
			return;
		}

		LocalDate today = timeZoneService.currentOrganizationDate();
		List<PolicyLeaveRequest> affectedRequests = policyLeaveRequestDao
			.findUpcomingRequests(PolicyLeaveConstant.ATTENDANCE_LEAVE_STATUSES, today)
			.stream()
			.filter(request -> getUpcomingDays(request.getStartDate(), request.getEndDate(), today).stream()
				.anyMatch(removingDays::contains))
			.toList();
		if (affectedRequests.isEmpty()) {
			return;
		}

		affectedRequests.forEach(request -> {
			LeaveRequestStatus originalStatus = request.getStatus();
			request.setStatus(originalStatus == LeaveRequestStatus.PENDING ? LeaveRequestStatus.CANCELLED
					: LeaveRequestStatus.REVOKED);

			if (request.getStartDate().equals(request.getEndDate())) {
				if (originalStatus == LeaveRequestStatus.PENDING) {
					policyAttendanceLeaveEmailService
						.sendNonWorkingDaySingleDayPendingLeaveRequestCancelEmployeeEmail(request);
					policyAttendanceLeaveNotificationService
						.sendNonWorkingDaySingleDayPendingLeaveRequestCancelEmployeeNotification(request);

					policyAttendanceLeaveEmailService
						.sendNonWorkingDaySingleDayPendingLeaveRequestCancelManagerEmail(request);
					policyAttendanceLeaveNotificationService
						.sendNonWorkingDaySingleDayPendingLeaveRequestCancelManagerNotification(request);
				}
				else {
					policyAttendanceLeaveEmailService
						.sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedEmployeeEmail(request);
					policyAttendanceLeaveNotificationService
						.sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedEmployeeNotification(request);

					policyAttendanceLeaveEmailService
						.sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedManagerEmail(request);
					policyAttendanceLeaveNotificationService
						.sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedManagerNotification(request);
				}
			}
			else {
				if (originalStatus == LeaveRequestStatus.PENDING) {
					policyAttendanceLeaveEmailService
						.sendNonWorkingDayMultiDayPendingLeaveRequestCancelEmployeeEmail(request, removingConfigs);
					policyAttendanceLeaveNotificationService
						.sendNonWorkingDayMultiDayPendingLeaveRequestCancelEmployeeNotification(request);

					policyAttendanceLeaveEmailService
						.sendNonWorkingDayMultiDayPendingLeaveRequestCancelManagerEmail(request, removingConfigs);
					policyAttendanceLeaveNotificationService
						.sendNonWorkingDayMultiDayPendingLeaveRequestCancelManagerNotification(request);
				}
				else {
					policyAttendanceLeaveEmailService
						.sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedEmployeeEmail(request);
					policyAttendanceLeaveNotificationService
						.sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedEmployeeNotification(request);

					policyAttendanceLeaveEmailService
						.sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedManagerEmail(request);
					policyAttendanceLeaveNotificationService
						.sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedManagerNotification(request);
				}
			}
		});
		policyLeaveRequestDao.saveAll(affectedRequests);

		log.info("voidLeaveRequestsOnRemovedDays: execution ended with {} request(s)", affectedRequests.size());
	}

	private Set<DayOfWeek> getUpcomingDays(LocalDate startDate, LocalDate endDate, LocalDate today) {
		LocalDate firstDate = startDate.isBefore(today) ? today : startDate;
		LocalDate lastDate = endDate.isAfter(firstDate.plusDays(6)) ? firstDate.plusDays(6) : endDate;

		Set<DayOfWeek> days = EnumSet.noneOf(DayOfWeek.class);
		firstDate.datesUntil(lastDate.plusDays(1)).map(LocalDate::getDayOfWeek).forEach(days::add);
		return days;
	}

	private Map<Long, List<LeaveRequestResponseDto>> groupByEmployee(List<PolicyLeaveRequest> policyLeaveRequests) {
		return policyLeaveRequests.stream()
			.collect(Collectors.groupingBy(policyLeaveRequest -> policyLeaveRequest.getEmployee().getEmployeeId(),
					Collectors.mapping(leaveMapper::policyLeaveRequestToLeaveRequestResponseDto, Collectors.toList())));
	}

	private boolean isWithinLeave(LeaveRequestResponseDto leaveRequest, LocalDate date) {
		return !date.isBefore(leaveRequest.getStartDate()) && !date.isAfter(leaveRequest.getEndDate());
	}

}
