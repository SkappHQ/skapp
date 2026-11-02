package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.LeaveState;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PolicyOnLeaveRequestResponseDto {

	private Long leaveRequestId;

	private Long policyId;

	private String policyName;

	private PolicyLeaveTypeDetailResponseDto leaveType;

	private LocalDate startDate;

	private LocalDate endDate;

	private LeaveState leaveState;

}
