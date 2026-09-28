package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeLeavePolicyDao
		extends JpaRepository<EmployeeLeavePolicy, Long>, EmployeeLeavePolicyRepository {

	List<EmployeeLeavePolicy> findByPolicy_IdAndStatus(Long policyId, EmployeeLeavePolicyStatus status);

}
