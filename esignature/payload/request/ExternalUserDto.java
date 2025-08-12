package com.skapp.enterprise.esignature.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExternalUserDto {

	@NotNull(message = "firstName is required")
	@NotBlank(message = "firstName cannot be blank")
	private String firstName;

	private String lastName;

	@NotNull(message = "email is required")
	private String email;

	private String phone;

}
