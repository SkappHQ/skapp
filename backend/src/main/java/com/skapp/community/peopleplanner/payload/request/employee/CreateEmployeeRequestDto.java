package com.skapp.community.peopleplanner.payload.request.employee;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateEmployeeRequestDto {

	private EmployeePersonalDetailsDto personal;

	private EmployeeEmergencyDetailsDto emergency;

	private EmployeeEmploymentDetailsDto employment;

	private EmployeeSystemPermissionsDto systemPermissions;

	private EmployeeCommonDetailsDto common;

}
