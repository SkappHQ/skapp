package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.PolicyLeaveValidationFailure;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PolicyLeaveAvailabilityResponseDto {

	private Long policyId;

	private String policyName;

	/** Working days the selected range would consume, half-days counted as 0.5. */
	private Float requestedDays;

	private Float remainingBalance;

	private Float balanceAfterRequest;

	private LocalDate validFrom;

	private LocalDate validTo;

	private Boolean isValid;

	private PolicyLeaveValidationFailure failureReason;

}
