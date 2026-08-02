package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeBirthdayResponseDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String authPic;

	private String email;

	private Boolean isCurrentUser;

}
