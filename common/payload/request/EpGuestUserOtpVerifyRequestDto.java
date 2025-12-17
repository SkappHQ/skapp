package com.skapp.enterprise.common.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpGuestUserOtpVerifyRequestDto {

	private String email;

	private String otp;

}
