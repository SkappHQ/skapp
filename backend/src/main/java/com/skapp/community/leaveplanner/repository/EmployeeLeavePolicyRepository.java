package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface EmployeeLeavePolicyRepository {

	List<EmployeeLeavePolicy> findByEmployeeIdsAndStatus(List<Long> employeeIds, EmployeeLeavePolicyStatus status);

	Page<EmployeeLeavePolicy> findByEmployeeIdAndStatusOrderByEffectiveFromDescIdDesc(Long employeeId,
			EmployeeLeavePolicyStatus status, Pageable pageable);

	Map<Long, Long> countByPolicyIdsAndStatus(List<Long> policyIds, EmployeeLeavePolicyStatus status);

}
