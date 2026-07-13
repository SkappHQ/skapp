package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.LeavePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LeavePolicyDao extends JpaRepository<LeavePolicy, Long>, JpaSpecificationExecutor<LeavePolicy> {

	boolean existsByNameIgnoreCaseAndLeaveType_TypeId(String name, Long leaveTypeId);

}
