package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface PolicyLeaveRequestRepository {

	/**
	 * Paged, filtered feed for the employee's own My Requests table. Built with the
	 * Criteria API rather than a {@code @Query} so an unselected filter is simply an
	 * absent predicate — binding a null or empty collection into an {@code IN} clause is
	 * what breaks the naive version.
	 */
	Page<PolicyLeaveRequest> findMyRequests(Long employeeId, LocalDate cycleStart, LocalDate cycleEnd,
			PolicyLeaveRequestFilterDto filterDto, Pageable pageable);

}
