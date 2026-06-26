package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class LeaveTrendDataResponseDto {

	private LeaveTypeBasicInfoDto leaveType;

	private Map<String, Float> leaveTrendData;

}
