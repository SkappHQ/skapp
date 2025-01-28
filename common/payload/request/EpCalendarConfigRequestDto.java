package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.EpCalendarType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpCalendarConfigRequestDto {

	private EpCalendarType type;

	private Boolean isEnabled;

}
