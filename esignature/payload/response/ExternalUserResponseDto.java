package com.skapp.enterprise.esignature.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExternalUserResponseDto {

	private Long userId;

	private String firstName;

	private String lastName;

	private String email;

	private String phone;

}
