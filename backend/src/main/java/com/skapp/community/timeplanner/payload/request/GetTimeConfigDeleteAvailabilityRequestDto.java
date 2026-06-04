package com.skapp.community.timeplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.util.List;

@Getter
@Setter
public class GetTimeConfigDeleteAvailabilityRequestDto {

	private List<DayOfWeek> days;

}
