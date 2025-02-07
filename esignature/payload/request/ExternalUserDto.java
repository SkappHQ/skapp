package com.skapp.enterprise.esignature.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExternalUserDto {

	@NotNull(message = "firstName is required")
	private String firstName;

	private String lastName;

	@NotNull(message = "email is required")
	@Email
	private String email;

	private String phone;

}
