package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.LeaveRequestAvailabilityFilterDto;
import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.payload.response.ClockInSummaryLeaveRequestResponseDto;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface PolicyAttendanceLeaveService {

	boolean isLeavePoliciesEnabled();

	ResponseEntityDto getPolicyLeaveDayAvailability(
			LeaveRequestAvailabilityFilterDto leaveRequestAvailabilityFilterDto);

	List<LeaveRequestResponseDto> getEmployeeLeaveRequests(Long employeeId, LocalDate startDate, LocalDate endDate,
			boolean activeUsersOnly);

	Map<Long, List<LeaveRequestResponseDto>> getEmployeesLeaveRequests(Collection<Long> employeeIds,
			LocalDate startDate, LocalDate endDate, boolean activeUsersOnly);

	Map<Long, List<LeaveRequestResponseDto>> getTeamLeaveRequests(Long teamId, LocalDate startDate, LocalDate endDate);

	LeaveRequestResponseDto findLeaveRequestOnDate(Map<Long, List<LeaveRequestResponseDto>> leaveRequestsByEmployee,
			Long employeeId, LocalDate date);

	boolean isOnApprovedLeave(Map<Long, List<LeaveRequestResponseDto>> leaveRequestsByEmployee, Long employeeId,
			LocalDate date);

	ClockInSummaryLeaveRequestResponseDto findClockInSummaryLeaveRequest(
			Map<Long, List<LeaveRequestResponseDto>> leaveRequestsByEmployee, Long employeeId, LocalDate date);

	Set<DayOfWeek> getDaysWithUpcomingLeaveRequests();

	void voidLeaveRequestsOnRemovedDays(List<TimeConfig> removingConfigs);

}
