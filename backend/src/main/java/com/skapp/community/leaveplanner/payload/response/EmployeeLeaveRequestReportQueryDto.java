package com.skapp.community.leaveplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@RequiredArgsConstructor
public class EmployeeLeaveRequestReportQueryDto {

	private Long employeeId;

	private String authPic;

	private String firstName;

	private String lastName;

	private String teams;

	private String leaveType;

	private String status;

	private String startDate;

	private String endDate;

	private String leaveTypeEmoji;

	private float days;

}
