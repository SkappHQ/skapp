package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeBasicDetailsResponseDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String middleName;

	private String authPic;

}
