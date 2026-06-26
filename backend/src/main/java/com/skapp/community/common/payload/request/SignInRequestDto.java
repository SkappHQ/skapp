package com.skapp.community.common.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignInRequestDto {

	@Schema(description = "User's email address", example = "user@example.com")
	@Email
	@NotNull
	private String email;

	@Schema(description = "User's password", example = "SecureP@ssword123")
	@NotNull
	private String password;

}
