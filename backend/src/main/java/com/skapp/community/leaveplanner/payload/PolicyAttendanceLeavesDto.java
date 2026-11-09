package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class PolicyAttendanceLeavesDto {

	private Boolean enabled;

	private Map<Long, List<LeaveRequestResponseDto>> leaveRequests;

}
