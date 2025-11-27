package com.skapp.enterprise.people.repository;

import com.skapp.community.peopleplanner.model.Employee;

import java.util.List;

public interface EpEmployeeRepository {

	List<Employee> getManagerRoleEmployeesExcludingEmployeeIds(List<Long> employeeIds);

	List<Employee> getAllGuestUsers();

}
