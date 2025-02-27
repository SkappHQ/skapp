package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.DateFormatType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsignConfigResponseDto {

	private DateFormatType dateFormat;

	private int defaultEnvelopeExpireDays;

	private int reminderDaysBeforeExpire;

}
