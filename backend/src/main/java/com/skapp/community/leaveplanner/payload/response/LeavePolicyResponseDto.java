package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.AccrualFrequency;
import com.skapp.community.leaveplanner.type.AccrualTiming;
import com.skapp.community.leaveplanner.type.FirstAccrualType;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import com.skapp.community.leaveplanner.type.PolicyType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeavePolicyResponseDto {

	private Long id;

	private String name;

	private Long leaveTypeId;

	private String leaveTypeName;

	private String leaveTypeEmoji;

	private PolicyType policyType;

	private LeavePolicyStatus status;

	private Float accrualDays;

	private AccrualFrequency frequency;

	private Integer waitingPeriodDays;

	private Float accrualCapDays;

	private Boolean isCarryoverEnabled;

	private String carryoverExpiryDate;

	private Float maxCarryoverDays;

	private FirstAccrualType firstAccrual;

	private AccrualTiming accrualTiming;

	private Long assignedEmployeeCount = 0L;

}
