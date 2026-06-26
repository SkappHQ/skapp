package com.skapp.community.common.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RefreshTokenRequestDto {

	@NotBlank
	private String refreshToken;

}
