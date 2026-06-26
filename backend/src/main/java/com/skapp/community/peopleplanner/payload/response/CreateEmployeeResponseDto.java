package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateEmployeeResponseDto {

	private String employeeId;

	private String firstName;

	private String lastName;

	private String authPic;

	private EmployeeCredentialsResponseDto employeeCredentials;

	private EmployeeRoleResponseDto employeeRole;

}
