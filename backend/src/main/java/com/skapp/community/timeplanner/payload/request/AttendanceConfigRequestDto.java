package com.skapp.community.timeplanner.payload.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AttendanceConfigRequestDto {

	private Boolean isClockInOnNonWorkingDays;

	private Boolean isClockInOnCompanyHolidays;

	private Boolean isClockInOnLeaveDays;

	private Boolean isAutoApprovalForChanges;

	private Boolean isGeoFencingEnabled;

	private Boolean isNotifyManagerOnLateArrival;
