package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LeaveRequestDao
		extends JpaRepository<LeaveRequest, Long>, JpaSpecificationExecutor<LeaveRequest>, LeaveRequestRepository {

}
