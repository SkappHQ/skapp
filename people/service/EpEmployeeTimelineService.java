package com.skapp.enterprise.people.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.payload.CurrentEmployeeDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeDetailsDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeQuickAddDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeUpdateDto;

public interface EpEmployeeTimelineService {

	ResponseEntityDto getEmployeeTimelineRecords(Long id);

	void addNewEmployeeTimeLineRecords(Employee employee, EmployeeDetailsDto employeeDetailsDto);

	void addNewQuickUploadedEmployeeTimeLineRecords(Employee savedEmployee, EmployeeQuickAddDto employeeQuickAddDto);

	void addUpdatedEmployeeTimeLineRecords(CurrentEmployeeDto currentEmployee, EmployeeUpdateDto employeeUpdateDto);

}
