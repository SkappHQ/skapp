package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeLeavePolicyDao
		extends JpaRepository<EmployeeLeavePolicy, Long>, EmployeeLeavePolicyRepository {

	Optional<EmployeeLeavePolicy> findByEmployee_EmployeeIdAndPolicy_LeaveType_IdAndStatus(Long employeeId,
			Long leaveTypeId, EmployeeLeavePolicyStatus status);

	Optional<EmployeeLeavePolicy> findByEmployee_EmployeeIdAndPolicy_IdAndStatus(Long employeeId, Long policyId,
			EmployeeLeavePolicyStatus status);

	Page<EmployeeLeavePolicy> findByEmployee_EmployeeIdAndStatusOrderByEffectiveFromDesc(Long employeeId,
			EmployeeLeavePolicyStatus status, Pageable pageable);

}
