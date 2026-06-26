package com.skapp.community.peopleplanner.payload.request.employee;

import com.skapp.community.peopleplanner.payload.request.employee.emergency.EmployeeEmergencyContactDetailsDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeEmergencyDetailsDto {

	private EmployeeEmergencyContactDetailsDto primaryEmergencyContact;

	private EmployeeEmergencyContactDetailsDto secondaryEmergencyContact;

}
