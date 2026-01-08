package com.skapp.enterprise.esignature.payload.request.verification;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UuidConvertToOtpValidateRequestDto {

	private String uuid;

	private String state;

	private String code;

}
