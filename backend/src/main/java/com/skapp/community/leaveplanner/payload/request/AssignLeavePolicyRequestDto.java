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

	/**
	 * Whether the window starts on the employee's hire date or an admin-picked date. Kept
	 * in the request only; the resolved date is persisted in {@code effectiveFrom}.
	 */
	@NotNull
	private EffectiveDateType effectiveDateType;

	/**
	 * Required only when {@link #effectiveDateType} is {@code SPECIFIC}.
	 */
	private LocalDate specificDate;

}
