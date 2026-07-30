package com.skapp.community.leaveplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UnassignLeavePolicyRequestDto {

	private Long employeeId;

	private Long policyId;

}
