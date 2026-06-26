package com.skapp.community.timeplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TimeRecordParentDto {

	private Long timeRecordId;

	private LocalDate date;

	private Double workedHours;

}
