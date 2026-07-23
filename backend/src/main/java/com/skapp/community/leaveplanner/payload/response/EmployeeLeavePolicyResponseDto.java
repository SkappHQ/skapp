package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.EffectiveDateType;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import com.skapp.community.leaveplanner.type.PolicyType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * A leave-policy assignment window as shown in the profile Leave Policies section.
 * <p>
 * Note: no entitlement balance is exposed here. Balance depends on an accrual engine that
 * does not yet exist; it will be added when that engine lands.
 */
@Getter
@Setter
public class EmployeeLeavePolicyResponseDto {

	private Long employeePolicyId;

	private Long employeeId;

	private Long policyId;

	private String policyName;

	private Long leaveTypeId;

	private String leaveTypeName;

	private String leaveTypeEmoji;

	private PolicyType policyType;

	private EffectiveDateType effectiveDateType;

	private LocalDate effectiveFrom;

	private LocalDate effectiveTo;

	private EmployeeLeavePolicyStatus status;

}
