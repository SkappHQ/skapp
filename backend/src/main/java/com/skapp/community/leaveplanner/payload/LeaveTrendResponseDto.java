package com.skapp.community.leaveplanner.payload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTrendResponseDto {

	Map<String, Float> totalLeaves;

	List<LeaveTrendDataResponseDto> totalLeavesWithType;

}
