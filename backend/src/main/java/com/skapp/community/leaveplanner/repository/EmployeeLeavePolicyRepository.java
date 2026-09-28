package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface EmployeeLeavePolicyRepository {

	List<EmployeeLeavePolicy> findByEmployeeIdsAndStatus(List<Long> employeeIds, EmployeeLeavePolicyStatus status);

	Optional<EmployeeLeavePolicy> findByEmployeeIdAndPolicyIdAndStatus(Long employeeId, Long policyId,
			EmployeeLeavePolicyStatus status);

	Optional<EmployeeLeavePolicy> findByEmployeeIdAndLeaveTypeIdAndStatus(Long employeeId, Long leaveTypeId,
			EmployeeLeavePolicyStatus status);

	List<EmployeeLeavePolicy> findByEmployeeIdAndStatusOrderByPolicyNameAsc(Long employeeId,
			EmployeeLeavePolicyStatus status);

	Page<EmployeeLeavePolicy> findByEmployeeIdAndStatusOrderByEffectiveFromDescIdDesc(Long employeeId,
			EmployeeLeavePolicyStatus status, Pageable pageable);

}
