package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeLeavePolicyDao extends JpaRepository<EmployeeLeavePolicy, Long> {

	Optional<EmployeeLeavePolicy> findByEmployee_EmployeeIdAndPolicy_LeaveType_IdAndStatus(Long employeeId,
			Long leaveTypeId, EmployeeLeavePolicyStatus status);

	Optional<EmployeeLeavePolicy> findByEmployee_EmployeeIdAndPolicy_IdAndStatus(Long employeeId, Long policyId,
			EmployeeLeavePolicyStatus status);

	Page<EmployeeLeavePolicy> findByEmployee_EmployeeIdAndStatusOrderByEffectiveFromDesc(Long employeeId,
			EmployeeLeavePolicyStatus status, Pageable pageable);

	List<EmployeeLeavePolicy> findByEmployee_EmployeeIdAndStatusOrderByEffectiveFromDesc(Long employeeId,
			EmployeeLeavePolicyStatus status);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("""
			SELECT elp
			FROM EmployeeLeavePolicy elp
			WHERE elp.employee.employeeId = :employeeId
			AND elp.policy.id = :policyId
			AND elp.status = :status
			""")
	Optional<EmployeeLeavePolicy> findActiveAssignmentForUpdate(@Param("employeeId") Long employeeId,
			@Param("policyId") Long policyId, @Param("status") EmployeeLeavePolicyStatus status);

}
