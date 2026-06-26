package com.skapp.community.timeplanner.payload.response;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClockInSummaryLeaveRequestResponseDto {

	private Long leaveRequestId;

	private LeaveState leaveState;

	private LeaveRequestStatus status;

	private ClockInSummaryLeaveTypeResponseDto leaveType;

}
