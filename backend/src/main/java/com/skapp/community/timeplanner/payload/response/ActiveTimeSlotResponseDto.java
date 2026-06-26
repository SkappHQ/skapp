package com.skapp.community.timeplanner.payload.response;

import com.skapp.community.timeplanner.type.TimeRecordActionTypes;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ActiveTimeSlotResponseDto {

	private TimeRecordActionTypes periodType;

	private LocalDateTime starTime;

	private float workHours;

	private float breakHours;

}
