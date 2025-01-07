package com.skapp.enterprise.common.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

@Data
public class EpPasswordResetOtpVerifyDto {

	private String tenantId;

	private String email;

	@NotNull(message = "OTP is required")
	@Length(min = 6, max = 6, message = "OTP must be 6 characters long")
	private String otp;

}
