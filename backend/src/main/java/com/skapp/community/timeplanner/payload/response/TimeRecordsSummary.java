package com.skapp.community.timeplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TimeRecordsSummary {

	private LocalDate startDate;

	private LocalDate endDate;

	private double workedHours;

	private String averageClockInTime;

	private String averageClockOutTime;

	private double leaves;

	private double holidays;

}
