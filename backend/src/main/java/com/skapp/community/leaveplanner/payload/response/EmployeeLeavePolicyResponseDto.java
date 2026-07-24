package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.EffectiveDateType;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import com.skapp.community.leaveplanner.type.PolicyType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeLeavePolicyResponseDto {

	private Long id;

	private Long employeeId;

	private Long policyId;

	private String policyName;

	private Long leaveTypeId;

	private String leaveTypeName;

	private String leaveTypeEmojiCode;

	private PolicyType policyType;

	private EffectiveDateType effectiveDateType;

	private LocalDate effectiveFrom;

	private LocalDate effectiveTo;

	private EmployeeLeavePolicyStatus status;

}
