package com.skapp.community.leaveplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@RequiredArgsConstructor
public class EmployeeCustomEntitlementResponseDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String authPic;

	private String teams;

	private String leaveType;

	private Float days;

	private String startDate;

	private String endDate;

	private String leaveTypeEmoji;

}
