package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeLeavePolicyDao extends JpaRepository<EmployeeLeavePolicy, Long> {

	/**
	 * The single open window for an employee within a leave type, if any. Used to detect
	 * and close a conflicting assignment when a new policy of the same leave type is
	 * assigned.
	 */
	Optional<EmployeeLeavePolicy> findByEmployee_EmployeeIdAndPolicy_LeaveType_TypeIdAndStatus(Long employeeId,
			Long leaveTypeId, EmployeeLeavePolicyStatus status);

	/**
	 * The open window for a specific (employee, policy), if any. Used by unassign.
	 */
	Optional<EmployeeLeavePolicy> findByEmployee_EmployeeIdAndPolicy_PolicyIdAndStatus(Long employeeId, Long policyId,
			EmployeeLeavePolicyStatus status);

	/**
	 * All windows for an employee with the given status, newest first. Used to render the
	 * profile Leave Policies section (status = ACTIVE).
	 */
	List<EmployeeLeavePolicy> findByEmployee_EmployeeIdAndStatusOrderByEffectiveFromDesc(Long employeeId,
			EmployeeLeavePolicyStatus status);

	/**
	 * All open windows for a policy. Used when a policy is deactivated so its open
	 * employee assignments can be closed in the same flow.
	 */
	List<EmployeeLeavePolicy> findByPolicy_PolicyIdAndStatus(Long policyId, EmployeeLeavePolicyStatus status);

}
