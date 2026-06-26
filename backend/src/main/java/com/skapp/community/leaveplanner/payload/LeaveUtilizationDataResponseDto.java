package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class LeaveUtilizationDataResponseDto {

	private LeaveTypeBasicInfoDto leaveType;

	private Map<String, Float> leaveUtilizationData;

}
