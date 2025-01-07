package com.skapp.enterprise.common.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpCaptchaVerificationDto {

	private String recaptchaToken;

}
