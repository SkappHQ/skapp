package com.skapp.community.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignInResponseDto {

	private String accessToken;

	private String refreshToken;

	private EmployeeSignInResponseDto employee;

	private Boolean isPasswordChangedForTheFirstTime;

}
