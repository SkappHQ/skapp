package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PolicyLeaveRequestDao
		extends JpaRepository<PolicyLeaveRequest, Long>, PolicyLeaveRequestRepository, PolicyLeaveReviewRepository {

}
