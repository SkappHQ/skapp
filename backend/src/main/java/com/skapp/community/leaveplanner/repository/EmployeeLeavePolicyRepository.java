package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;

import java.util.Collection;
import java.util.List;

public interface EmployeeLeavePolicyRepository {

	List<EmployeeLeavePolicy> findByEmployeeIdsAndStatus(Collection<Long> employeeIds,
			EmployeeLeavePolicyStatus status);

}
