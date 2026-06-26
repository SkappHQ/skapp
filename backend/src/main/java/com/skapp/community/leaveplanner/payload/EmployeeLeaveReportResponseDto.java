package com.skapp.community.leaveplanner.payload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeLeaveReportResponseDto {

	List<LeaveEntitlementReportDto> leaveEntitlementReportDtos;

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String authPic;

}
