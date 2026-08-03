package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeLeavePolicyDao extends JpaRepository<EmployeeLeavePolicy, Long> {

	Optional<EmployeeLeavePolicy> findByEmployee_EmployeeIdAndPolicy_LeaveType_IdAndStatus(Long employeeId,
			Long leaveTypeId, EmployeeLeavePolicyStatus status);

	@EntityGraph(attributePaths = { "employee", "policy", "policy.leaveType" })
	List<EmployeeLeavePolicy> findByEmployee_EmployeeIdInAndStatus(Collection<Long> employeeIds,
			EmployeeLeavePolicyStatus status);

	Optional<EmployeeLeavePolicy> findByEmployee_EmployeeIdAndPolicy_IdAndStatus(Long employeeId, Long policyId,
			EmployeeLeavePolicyStatus status);

	List<EmployeeLeavePolicy> findByEmployee_EmployeeIdAndStatusOrderByEffectiveFromDesc(Long employeeId,
			EmployeeLeavePolicyStatus status);

}
