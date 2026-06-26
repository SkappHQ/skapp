package com.skapp.community.common.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class TestEmailServerRequestDto {

	@Email
	@NotNull
	private String email;

	@NotNull
	private String subject;

	@NotNull
	private String body;

}
