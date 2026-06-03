package com.skapp.community.common.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SuperAdminSignUpRequestDto {

	@Schema(description = "The first name of the Super Admin", example = "John")
	@NotNull
	private String firstName;

	@Schema(description = "The last name of the Super Admin", example = "Doe")
	@NotNull
	private String lastName;

	@Schema(description = "The work email address of the Super Admin", example = "john.doe@company.com")
	@NotNull
	@Email
	private String email;

	@Schema(description = "The password for the Super Admin", example = "SecureP@ssword123")
	@NotNull
	private String password;

	@Schema(description = "The reCAPTCHA token for verification")
	private String recaptchaToken;

}
