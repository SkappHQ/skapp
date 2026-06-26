package com.skapp.community.timeplanner.payload.request;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AttendanceSummaryDto {

	private Float totalWorkHours;

	private Float totalBreakHours;

}
