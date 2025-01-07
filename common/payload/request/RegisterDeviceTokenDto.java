package com.skapp.enterprise.common.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterDeviceTokenDto {

	@NotBlank
	private String deviceToken;

}
