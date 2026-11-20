package com.skapp.community.peopleplanner.repository;

import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.model.Employee;

public interface EmployeeManagerRepository {

	void deleteByEmployeeAndManagerType(Employee employee, ManagerType managerType);

}
