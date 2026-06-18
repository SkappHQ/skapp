package com.skapp.community.timeplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AttendanceSummaryResponseDto {

	private String workedHours;

	private String breakHours;

}
