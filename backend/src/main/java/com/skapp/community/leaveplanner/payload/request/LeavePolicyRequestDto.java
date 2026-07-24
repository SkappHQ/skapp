package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.PolicyType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeavePolicyRequestDto {

	private String name;

	private Long leaveTypeId;

	private PolicyType policyType;

	private LeavePolicyAccrualDetailDto accrual;

}
