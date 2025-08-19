package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeaveType;
import com.skapp.community.peopleplanner.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveEntitlementDao extends JpaRepository<LeaveEntitlement, Long>,
		JpaSpecificationExecutor<LeaveEntitlement>, LeaveEntitlementRepository {

	List<LeaveEntitlement> findByEmployeeAndValidFromAndValidToAndLeaveType(Employee employee, LocalDate validFrom,
			LocalDate validTo, LeaveType leaveType);

	List<LeaveEntitlement> findAllByEmployeeAndLeaveTypeAndIsActiveTrue(Employee employee, LeaveType leaveType);

	List<LeaveEntitlement> findAllByLeaveType(LeaveType leaveType);

	List<LeaveEntitlement> findByEmployee_EmployeeId(Long employeeId);

}
