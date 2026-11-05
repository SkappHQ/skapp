package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.leaveplanner.constant.PolicyLeaveConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.payload.PolicyLeaveDateWindowDto;
import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestDao;
import com.skapp.community.leaveplanner.service.LeavePolicyService;
import com.skapp.community.leaveplanner.service.PolicyAttendanceLeaveService;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.timeplanner.payload.response.ClockInSummaryLeaveRequestResponseDto;
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

	@Override
	public boolean isLeavePoliciesEnabled() {
		return leavePolicyService.isLeavePoliciesEnabled();
	}

	@Override
	@Transactional(readOnly = true)
	public List<LeaveRequestResponseDto> getEmployeeLeaveRequests(Long employeeId, LocalDate startDate,
			LocalDate endDate) {
		log.info("getEmployeeLeaveRequests: execution started");

		List<LeaveRequestResponseDto> leaveRequests = policyLeaveRequestDao
			.findEmployeesRequestsInRange(List.of(employeeId), PolicyLeaveConstant.ATTENDANCE_LEAVE_STATUSES, startDate,
					endDate)
			.stream()
			.map(leaveMapper::policyLeaveRequestToLeaveRequestResponseDto)
			.toList();

		log.info("getEmployeeLeaveRequests: execution ended");
		return leaveRequests;
	}

	@Override
	@Transactional(readOnly = true)
	public Map<Long, List<LeaveRequestResponseDto>> getEmployeesLeaveRequests(Collection<Long> employeeIds,
			LocalDate startDate, LocalDate endDate) {
		log.info("getEmployeesLeaveRequests: execution started");

		Map<Long, List<LeaveRequestResponseDto>> leaveRequestsByEmployee = groupByEmployee(
				policyLeaveRequestDao.findEmployeesRequestsInRange(employeeIds,
						PolicyLeaveConstant.ATTENDANCE_LEAVE_STATUSES, startDate, endDate));

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
		return leaveRequestsByEmployee.getOrDefault(employeeId, List.of())
			.stream()
			.filter(leaveRequest -> isWithinLeave(leaveRequest, date))
			.findFirst()
			.orElse(null);
	}

	@Override
	public boolean isOnApprovedLeave(Map<Long, List<LeaveRequestResponseDto>> leaveRequestsByEmployee, Long employeeId,
			LocalDate date) {
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
			LocalDate firstDate = window.getStartDate().isBefore(today) ? today : window.getStartDate();
			LocalDate lastDate = window.getEndDate().isAfter(firstDate.plusDays(6)) ? firstDate.plusDays(6)
					: window.getEndDate();

			firstDate.datesUntil(lastDate.plusDays(1)).map(LocalDate::getDayOfWeek).forEach(days::add);

			if (days.size() == DayOfWeek.values().length) {
				break;
			}
		}

		log.info("getDaysWithUpcomingLeaveRequests: execution ended");
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
