package com.skapp.community.leaveplanner.payload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeaveEntitlementReportDto {

	private Long leaveTypeId;

	private Double totalDaysAllocated;

	private Double totalDaysUsed;

	private Double totalBalanceDays;

}
