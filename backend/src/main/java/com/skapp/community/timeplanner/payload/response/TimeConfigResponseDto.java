package com.skapp.community.timeplanner.payload.response;

import lombok.Getter;
import lombok.Setter;
import tools.jackson.databind.JsonNode;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@Setter
public class TimeConfigResponseDto {

	private Long id;

	private DayOfWeek day;

	private JsonNode timeBlocks;

	private Float totalHours;

	private Boolean isWeekStartDay;

	private LocalTime startTime;

}
