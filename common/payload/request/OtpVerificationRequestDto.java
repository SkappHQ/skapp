package com.skapp.enterprise.common.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
public class OtpVerificationRequestDto {

	@NotNull(message = "OTP is required")
	@Length(min = 6, max = 6, message = "OTP must be 6 characters long")
	private String otp;

}
