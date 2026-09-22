package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.LeaveState;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PolicyLeaveAvailabilityRequestDto {

	private Long policyId;

	private LocalDate startDate;

	private LocalDate endDate;

	private LeaveState leaveState;

}
