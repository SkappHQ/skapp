package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.PolicyBalanceDisabledReason;
import com.skapp.community.leaveplanner.type.PolicyType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * One card in the My Leave Allocation section. There is exactly one of these per assigned
 * policy — two policies sharing a leave type produce two cards and are never merged.
 */
@Getter
@Setter
public class EmployeePolicyBalanceResponseDto {

	private Long assignmentId;

	private Long policyId;

	private String policyName;

	private PolicyType policyType;

	private PolicyLeaveTypeDetailResponseDto leaveType;

	private Integer year;

	/** The employee's assignment effective date for this policy. */
	private LocalDate effectiveFrom;

	/** Start of the usable window in this cycle. */
	private LocalDate validFrom;

	/** End of the cycle — the date this balance expires. */
	private LocalDate validTo;

	private Float carriedForwardDays;

	private Float accruedDays;

	private Float totalDaysAllocated;

	private Float totalDaysUsed;

	private Float balanceInDays;

	/** True for flexible policies, which grant leave without deducting a balance. */
	private Boolean isUnlimited;

	/**
	 * False when the balance could not be derived, so the card renders the "—" placeholder
	 * rather than misleadingly showing zero.
	 */
	private Boolean isBalanceAvailable;

	private Boolean isDisabled;

	private PolicyBalanceDisabledReason disabledReason;

}
