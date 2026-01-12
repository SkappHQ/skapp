package com.skapp.enterprise.esignature.payload.request;

import com.skapp.enterprise.esignature.type.DateFormatType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsignConfigDto {

	private DateFormatType dateFormat;

	private Integer defaultEnvelopeExpireDays;

	private Integer reminderDaysBeforeExpire;

	private Boolean isMfaEnabled;

}
