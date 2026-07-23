package com.skapp.community.leaveplanner.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UnassignLeavePolicyRequestDto {

	@NotNull
	private Long employeeId;

	@NotNull
	private Long policyId;

}
