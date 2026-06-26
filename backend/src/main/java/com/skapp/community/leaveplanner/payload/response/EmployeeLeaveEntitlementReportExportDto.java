package com.skapp.community.leaveplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeLeaveEntitlementReportExportDto {

	private Long employeeId;

	private String employeeName;

	private String teams;

	private String jobFamily;

	private String leaveName;

	private Float totalDaysAllocated;

	private Float totalDaysUsed;

	private Float totalBalanceDays;

}
