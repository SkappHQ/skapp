package com.skapp.community.peopleplanner.repository;

import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.model.Employee;

import java.util.List;

public interface EmployeeManagerRepository {

	void deleteByEmployeeAndManagerType(Employee employee, ManagerType managerType);

	List<Long> findManagerSupervisingEmployee(Long managerId);

}
