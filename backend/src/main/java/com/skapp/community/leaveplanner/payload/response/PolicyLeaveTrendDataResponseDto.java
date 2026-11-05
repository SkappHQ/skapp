package com.skapp.community.leaveplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class PolicyLeaveTrendDataResponseDto {

	private PolicyLeaveTypeBasicInfoResponseDto leaveType;

	private Map<String, Float> leaveTrendData;

}
