package com.skapp.enterprise.esignature.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExternalUserDto {

	@NotNull(message = "firstName is required")
	private String firstName;

	@NotNull(message = "lastName is required")
	private String lastName;

	@NotNull(message = "email is required")
	private String email;

	private String phone;

}
