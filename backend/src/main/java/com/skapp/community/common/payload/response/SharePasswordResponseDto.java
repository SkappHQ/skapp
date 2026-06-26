package com.skapp.community.common.payload.response;

import com.skapp.community.peopleplanner.payload.response.EmployeeCredentialsResponseDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SharePasswordResponseDto {

	private Long userId;

	private EmployeeCredentialsResponseDto employeeCredentials;

	private String firstName;

	private String lastName;

}
