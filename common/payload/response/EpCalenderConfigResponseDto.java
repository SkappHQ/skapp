package com.skapp.enterprise.common.payload.response;

import com.skapp.enterprise.common.type.EpCalendarType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpCalenderConfigResponseDto {

	private EpCalendarType type;

	private Boolean isEnabled;

}
