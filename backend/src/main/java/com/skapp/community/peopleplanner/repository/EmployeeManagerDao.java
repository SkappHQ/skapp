package com.skapp.community.peopleplanner.repository;

import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.type.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeManagerDao extends JpaRepository<EmployeeManager, Long>, EmployeeManagerRepository {

	List<EmployeeManager> findByEmployee(Employee employee);

	boolean existsByEmployee(Employee employee);

	List<EmployeeManager> findByManager(Employee employee);

	List<EmployeeManager> findByManagerInAndManagerType(List<Employee> employees, ManagerType managerType);

	List<EmployeeManager> findByManagerAndManagerTypeAndEmployeeAccountStatusIn(Employee manager,
			ManagerType managerType, List<AccountStatus> accountStatuses);

	Optional<EmployeeManager> findByManagerAndEmployeeAndManagerType(Employee manager, Employee employee,
			ManagerType managerType);

}
