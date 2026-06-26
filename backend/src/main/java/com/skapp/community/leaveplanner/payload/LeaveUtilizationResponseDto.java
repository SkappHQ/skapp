package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class LeaveUtilizationResponseDto {

	Map<String, Float> totalLeaves;

	List<LeaveUtilizationDataResponseDto> totalLeavesWithType;

}
