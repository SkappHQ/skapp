package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AverageLeaveConsumptionDto {

	private LeaveTypeBasicInfoDto leaveType;

	private Float averageConsumption;

	private Float consumedPercentage;

}
