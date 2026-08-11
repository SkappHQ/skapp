package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.PolicyBalanceDisabledReason;
import com.skapp.community.leaveplanner.type.PolicyType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeePolicyBalanceResponseDto {

	private Long assignmentId;

	private Long policyId;

	private String policyName;

	private PolicyType policyType;

	private PolicyLeaveTypeDetailResponseDto leaveType;

	private Integer year;

	private LocalDate effectiveFrom;

	private LocalDate validFrom;

	private LocalDate validTo;

	private Float accruedDays;

	private Float totalDaysAllocated;

	private Float totalDaysUsed;

	private Float balanceInDays;

	private Boolean isUnlimited;

	private Boolean isBalanceAvailable;

	private Boolean isDisabled;

	private PolicyBalanceDisabledReason disabledReason;

}
