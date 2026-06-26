package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeCredentialsResponseDto {

	private String tempPassword;

	private String email;

}
