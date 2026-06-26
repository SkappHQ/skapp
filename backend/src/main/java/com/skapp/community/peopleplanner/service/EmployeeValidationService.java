package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.model.User;
import com.skapp.community.peopleplanner.payload.request.employee.CreateEmployeeRequestDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeEmploymentDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeePersonalDetailsDto;

public interface EmployeeValidationService {

	void validateCreateEmployeeRequestEmploymentDetails(EmployeeEmploymentDetailsDto employmentDetailsDto, User user);

	void validateCreateEmployeeRequestPersonalDetails(EmployeePersonalDetailsDto employeePersonalDetailsDto, User user);

	void validateCreateEmployeeRequestRequiredFields(CreateEmployeeRequestDto createEmployeeRequestDto, User user);

}
