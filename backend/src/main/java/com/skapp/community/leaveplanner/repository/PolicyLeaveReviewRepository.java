package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.payload.request.PolicyManagerLeaveRequestFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface PolicyLeaveReviewRepository {

	Page<PolicyLeaveRequest> findRequestsAssignedToManager(Long managerEmployeeId,
			PolicyManagerLeaveRequestFilterDto filterDto, Pageable pageable);

	List<PolicyLeaveRequest> findPendingRequestsAssignedToManager(Long managerEmployeeId, String searchKeyword);

	Optional<PolicyLeaveRequest> findByIdForUpdate(Long id);

}
