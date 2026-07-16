package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.PolicyType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeavePolicyRequestDto {

	@NotBlank(message = "Policy name is required")
	@Size(max = 100, message = "Policy name cannot exceed 100 characters")
	private String name;

	@NotNull(message = "Leave type is required")
	private Long leaveTypeId;

	@NotNull(message = "Policy type is required")
	private PolicyType policyType;

	@Valid
	private LeavePolicyAccrualDetailDto accrual;

}
