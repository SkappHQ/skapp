package com.skapp.community.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeSignInResponseDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String jobFamily;

	private String jobTitle;

	private String authPic;

}
