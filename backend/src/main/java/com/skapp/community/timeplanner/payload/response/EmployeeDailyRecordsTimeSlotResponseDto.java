package com.skapp.community.timeplanner.payload.response;

import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.deserializer.Base64BooleanDeserializer;
import com.skapp.community.timeplanner.type.SlotType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import tools.jackson.databind.annotation.JsonDeserialize;

import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
public class EmployeeDailyRecordsTimeSlotResponseDto {

	private Long timeSlotId;

	private Long startTime;

	private Long endTime;

	private SlotType slotType;

	@JsonDeserialize(using = Base64BooleanDeserializer.class)
	private Boolean isActiveRightNow;

	@JsonDeserialize(using = Base64BooleanDeserializer.class)
	private Boolean isManualEntry;

	public LocalTime getStartTime() {
		return this.startTime != null ? DateTimeUtils.epochMillisToUtcLocalTime(this.startTime) : null;
	}

	public LocalTime getEndTime() {
		return this.endTime != null ? DateTimeUtils.epochMillisToUtcLocalTime(this.endTime) : null;
	}

}
