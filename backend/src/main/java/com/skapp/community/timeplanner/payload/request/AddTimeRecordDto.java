package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.timeplanner.type.TimeRecordActionTypes;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class AddTimeRecordDto {

	private Instant time = Instant.now();

	private TimeRecordActionTypes recordActionType;

}
