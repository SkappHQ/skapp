package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.LeaveState;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Real-time balance pre-check fired by the apply-leave modal whenever the selected dates
 * change, so the user sees the insufficient-balance error before submitting.
 */
@Getter
@Setter
public class PolicyLeaveAvailabilityRequestDto {

	@NotNull
	private Long policyId;

	@NotNull
	private LocalDate startDate;

	@NotNull
	private LocalDate endDate;

	@NotNull
	private LeaveState leaveState;

}
