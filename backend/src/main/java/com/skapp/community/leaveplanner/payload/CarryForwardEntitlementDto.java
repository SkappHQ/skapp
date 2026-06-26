package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CarryForwardEntitlementDto {

	private Long leaveTypeId;

	private Float totalDaysAllocated;

	private Float totalDaysUsed;

	private Float carryForwardAmount;

	private String name;

}
