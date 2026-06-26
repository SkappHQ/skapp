package com.skapp.community.timeplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TimeSheetSummaryData {

	private Double workedHours;

	private Double averageClockInTime;

	private Double averageClockOutTime;

}
