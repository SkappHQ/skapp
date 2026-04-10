package com.skapp.enterprise.people.repository;

import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.type.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Set;

public interface EpEmployeeDao
		extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee>, EpEmployeeRepository {

	List<Employee> findAllByEmployeeIdInAndAccountStatusIn(List<Long> employeeIds, Set<AccountStatus> active);

	List<Employee> findAllByEmployeeRolePmRoleAndAccountStatusIn(Role pmRole, List<AccountStatus> statuses);

}
