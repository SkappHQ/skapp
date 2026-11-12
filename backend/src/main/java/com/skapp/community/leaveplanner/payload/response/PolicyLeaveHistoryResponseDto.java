package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
public class PolicyLeaveHistoryResponseDto {

	private Long leaveRequestId;

	private LocalDate startDate;

	private LocalDate endDate;

	private PolicyLeaveTypeBasicInfoResponseDto leaveType;

	private LeaveState leaveState;

	private LeaveRequestStatus status;

	private Boolean isViewed;

	private Float durationDays;

	private String requestDesc;

	private Instant createdDate;

}
