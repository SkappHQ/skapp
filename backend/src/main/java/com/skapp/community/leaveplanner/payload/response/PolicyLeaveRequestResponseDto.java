package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PolicyLeaveRequestResponseDto {

	private Long leaveRequestId;

	private Long policyId;

	private String policyName;

	private PolicyLeaveTypeDetailResponseDto leaveType;

	private LocalDate startDate;

	private LocalDate endDate;

	private LeaveState leaveState;

	private LeaveRequestStatus status;

	private Float durationDays;

	private String requestDesc;

	private String reviewerComment;

	private LocalDateTime reviewedDate;

	private Boolean isViewed;

	private Boolean isAutoApproved;

	private LocalDateTime createdDate;

	private List<PolicyLeaveAttachmentResponseDto> attachments;

	/** Balance left on the policy once this request is accounted for. */
	private Float remainingBalance;

}
