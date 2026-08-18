package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.payload.PolicyLeaveUsageDto;
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

	Optional<PolicyLeaveRequest> findByIdForUpdate(Long id);

	List<PolicyLeaveUsageDto> findCommittedUsageForPolicyInWindow(Long employeeId, Long policyId,
			Collection<LeaveRequestStatus> statuses, LocalDate windowStart, LocalDate windowEnd);

	Map<Long, List<PolicyLeaveUsageDto>> findCommittedUsageForPoliciesInWindow(Long employeeId,
			Collection<Long> policyIds, Collection<LeaveRequestStatus> statuses, LocalDate windowStart,
			LocalDate windowEnd);

	List<PolicyLeaveRequest> findOverlappingRequests(Long employeeId, Collection<LeaveRequestStatus> statuses,
			LocalDate startDate, LocalDate endDate);

}
