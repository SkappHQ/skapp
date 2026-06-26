package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeSummarizedResponseDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String designation;

	private String authPic;

}
