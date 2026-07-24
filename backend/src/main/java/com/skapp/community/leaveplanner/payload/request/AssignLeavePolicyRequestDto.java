package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.EffectiveDateType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AssignLeavePolicyRequestDto {

	@NotNull
	private Long employeeId;

	@NotNull
	private Long policyId;

	@NotNull
	private EffectiveDateType effectiveDateType;

	private LocalDate specificDate;

}
