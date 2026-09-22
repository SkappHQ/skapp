package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PolicyLeaveRequestDao extends JpaRepository<PolicyLeaveRequest, Long>, PolicyLeaveRequestRepository {

	List<PolicyLeaveRequest> findByPolicy_IdAndStatus(Long policyId, LeaveRequestStatus status);

	List<PolicyLeaveRequest> findByPolicy_IdAndStatusAndStartDateAfter(Long policyId, LeaveRequestStatus status,
			LocalDate startDate);

}
