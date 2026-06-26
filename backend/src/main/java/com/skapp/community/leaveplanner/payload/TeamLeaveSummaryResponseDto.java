package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class TeamLeaveSummaryResponseDto {

	private Float leaveTakenCount;

	private Float monthOverMonthRate;

	private List<AverageLeaveConsumptionDto> averageConsumptionByType;

}
