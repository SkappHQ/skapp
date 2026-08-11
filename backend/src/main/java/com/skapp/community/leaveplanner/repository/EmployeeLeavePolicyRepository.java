package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;

import java.util.Optional;

public interface EmployeeLeavePolicyRepository {

	Optional<EmployeeLeavePolicy> findActiveAssignmentForUpdate(Long employeeId, Long policyId,
			EmployeeLeavePolicyStatus status);

}
