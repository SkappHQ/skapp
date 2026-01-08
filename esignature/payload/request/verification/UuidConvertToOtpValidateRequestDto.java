package com.skapp.enterprise.esignature.payload.request.verification;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UuidConvertToOtpValidateRequestDto {

	@NotBlank
	private String uuid;

	@NotBlank
	private String state;

	@NotBlank
	private String code;

}
