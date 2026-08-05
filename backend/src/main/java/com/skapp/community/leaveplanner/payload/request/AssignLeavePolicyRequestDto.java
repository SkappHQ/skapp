package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.EffectiveDateType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AssignLeavePolicyRequestDto {

	private Long employeeId;

	private Long policyId;

	private EffectiveDateType effectiveDateType;

	private LocalDate specificDate;

}
