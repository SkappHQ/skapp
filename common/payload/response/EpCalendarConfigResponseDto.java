package com.skapp.enterprise.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpCalendarConfigResponseDto {

	private Boolean isGoogleCalendarEnabled;

	private Boolean isMicrosoftCalendarEnabled;

}
