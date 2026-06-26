package com.skapp.community.leaveplanner.payload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeLeaveEntitlementsDto {

	private String leaveName;

	private Float totalDaysAllocated;

	private Float totalDaysUsed;

	private Float totalBalanceDays;

}
