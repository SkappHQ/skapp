package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.security.Permission;

@Getter
@Setter
public class EmployeeDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String designation;

	private String authPic;

	private String identificationNo;

	private Permission permission;

	private String email;

}
