package com.skapp.community.timeplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ManagerEmployeeDailyRecordsResponseDto {

	private Long timeRecordId;

	private LocalDate date;

	private DayOfWeek day;

	private Float workedHours;

	private Float breakHours;

	private List<TimeSlotDto> timeSlots;

}
