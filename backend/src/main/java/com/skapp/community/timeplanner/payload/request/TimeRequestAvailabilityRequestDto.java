package com.skapp.community.timeplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TimeRequestAvailabilityRequestDto {

	private LocalDate date;

	private Long startTime;

	private Long endTime;

}
