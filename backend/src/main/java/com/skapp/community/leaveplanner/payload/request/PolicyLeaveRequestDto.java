package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.LeaveState;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

/**
 * Apply for leave against one specific leave policy. Unlike the legacy
 * {@link LeaveRequestDto} this is scoped by {@code policyId}, not by leave type — two
 * policies of the same leave type are addressed independently.
 */
@Getter
@Setter
public class PolicyLeaveRequestDto {

	@NotNull
	private Long policyId;

	@NotNull
	private LocalDate startDate;

	@NotNull
	private LocalDate endDate;

	@NotNull
	private LeaveState leaveState;

	private String requestDesc;

	@Valid
	private List<PolicyLeaveAttachmentDto> attachments;

}
