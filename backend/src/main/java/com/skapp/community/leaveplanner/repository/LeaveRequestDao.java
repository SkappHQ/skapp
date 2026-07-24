package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestDao
		extends JpaRepository<LeaveRequest, Long>, JpaSpecificationExecutor<LeaveRequest>, LeaveRequestRepository {

	List<LeaveRequest> findByStatus(LeaveRequestStatus status);

}
