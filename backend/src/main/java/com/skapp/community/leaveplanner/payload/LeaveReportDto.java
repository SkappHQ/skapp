package com.skapp.community.leaveplanner.payload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@AllArgsConstructor
@RequiredArgsConstructor
public class LeaveReportDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String authPic;

	private Long leaveTypeId;

	private float totalDaysAllocated;

	private float totalDaysUsed;

	private float totalBalanceDays;

}
