package com.skapp.enterprise.people.repository;

import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.type.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpEmployeeManagerDao extends JpaRepository<EmployeeManager, Long> {

	List<EmployeeManager> findByManagerInAndManagerTypeAndEmployeeAccountStatusIn(List<Employee> employees,
			ManagerType managerType, List<AccountStatus> accountStatuses);

	List<EmployeeManager> findByManagerAndManagerType(Employee currentManager, ManagerType managerType);

}
