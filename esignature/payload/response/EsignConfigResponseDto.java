package com.skapp.enterprise.esignature.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsignConfigResponseDto {

	private String dateFormat;

	private int defaultEnvelopeExpireDays;

	private int reminderDaysBeforeExpire;

	private Boolean isMfaEnabled;

}
