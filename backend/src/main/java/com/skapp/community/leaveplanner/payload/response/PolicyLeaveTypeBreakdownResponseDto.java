package com.skapp.community.leaveplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class PolicyLeaveTypeBreakdownResponseDto {

	private Map<String, Float> totalLeaves;

	private List<PolicyLeaveTypeBreakdownDataResponseDto> totalLeavesWithType;

}
