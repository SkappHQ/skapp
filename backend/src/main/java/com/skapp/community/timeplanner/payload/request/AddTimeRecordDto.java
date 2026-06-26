package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.timeplanner.type.TimeRecordActionTypes;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AddTimeRecordDto {

	private LocalDateTime time = DateTimeUtils.getCurrentUtcDateTime();

	private TimeRecordActionTypes recordActionType;

}
