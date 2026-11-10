package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.payload.PolicyLeaveDateWindowDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveMonthlyDurationDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveSpanDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveUsageDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface PolicyLeaveRequestRepository {

	Page<PolicyLeaveRequest> findMyRequests(Long employeeId, LocalDate cycleStart, LocalDate cycleEnd,
			PolicyLeaveRequestFilterDto filterDto, Pageable pageable);

	Page<PolicyLeaveRequest> findSupervisedRequests(Long supervisorEmployeeId, PolicyLeaveRequestFilterDto filterDto,
			Pageable pageable);

	Page<PolicyLeaveRequest> findLeaveHistory(Long teamId, Collection<Long> employeeIds, LocalDate startDate,
			LocalDate endDate, PolicyLeaveHistoryFilterDto filterDto, Pageable pageable);

	Optional<PolicyLeaveRequest> findByIdForUpdate(Long id);

	List<PolicyLeaveUsageDto> findCommittedUsageForPolicyInWindow(Long employeeId, Long policyId,
			Collection<LeaveRequestStatus> statuses, LocalDate windowStart, LocalDate windowEnd);

	Map<Long, List<PolicyLeaveUsageDto>> findCommittedUsageForPoliciesInWindow(Long employeeId, List<Long> policyIds,
			Collection<LeaveRequestStatus> statuses, LocalDate windowStart, LocalDate windowEnd);

	List<PolicyLeaveRequest> findOverlappingRequests(Long employeeId, Collection<LeaveRequestStatus> statuses,
			LocalDate startDate, LocalDate endDate);

	long countSupervisedPendingRequests(Long supervisorEmployeeId, List<Long> teamIds);

	long countEmployeesOnApprovedLeaveOnDate(LocalDate date, List<Long> teamIds, Long supervisorEmployeeId);

	long countEmployeesInScope(List<Long> teamIds, Long supervisorEmployeeId);

	long countEmployeesInScope(List<Long> teamIds, Long supervisorEmployeeId, boolean includeOwnTeams);

	List<PolicyLeaveRequest> findApprovedRequestsInRange(LocalDate startDate, LocalDate endDate, List<Long> teamIds,
			Long supervisorEmployeeId);

	List<PolicyLeaveMonthlyDurationDto> findApprovedSingleMonthDurations(LocalDate startDate, LocalDate endDate,
			List<Long> leaveTypeIds, List<Long> teamIds, Long supervisorEmployeeId);

	List<PolicyLeaveSpanDto> findApprovedMultiMonthSpans(LocalDate startDate, LocalDate endDate,
			List<Long> leaveTypeIds, List<Long> teamIds, Long supervisorEmployeeId);

	double sumApprovedDurationWithinWindow(Collection<Long> employeeIds, LocalDate startDate, LocalDate endDate);

	List<PolicyLeaveSpanDto> findApprovedSpansCrossingWindow(Collection<Long> employeeIds, LocalDate startDate,
			LocalDate endDate);

	List<PolicyLeaveRequest> findEmployeesRequestsInRange(Collection<Long> employeeIds,
			Collection<LeaveRequestStatus> statuses, LocalDate startDate, LocalDate endDate, boolean activeUsersOnly);

	List<PolicyLeaveRequest> findTeamRequestsInRange(Long teamId, Collection<LeaveRequestStatus> statuses,
			LocalDate startDate, LocalDate endDate);

	List<PolicyLeaveDateWindowDto> findUpcomingRequestDateWindows(Collection<LeaveRequestStatus> statuses,
			LocalDate fromDate);

	List<PolicyLeaveRequest> findUpcomingRequests(Collection<LeaveRequestStatus> statuses, LocalDate fromDate);

}
