package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.AccrualFrequency;
import com.skapp.community.leaveplanner.type.AccrualTiming;
import com.skapp.community.leaveplanner.type.PolicyType;
import com.skapp.community.leaveplanner.type.FirstAccrualType;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LeavePolicyResponseDto {

	private Long policyId;

	private String name;

	private Long leaveTypeId;

	private String leaveTypeName;

	private String leaveTypeEmoji;

	private PolicyType policyType;

	private LeavePolicyStatus status;

	private Float fixedDaysAllocated;

	private Boolean carryForwardEnabled;

	private Float maxCarryForwardDays;

	private LocalDate carryForwardExpiryDate;

	private Float accrualDays;

	private AccrualFrequency frequency;

	private Integer waitingPeriodDays;

	private Float accrualCapDays;

	private Boolean carryoverEnabled;

	private String carryoverDate;

	private Boolean resetNegativeOnCarryover;

	private FirstAccrualType firstAccrual;

	private AccrualTiming accrualTiming;

}
