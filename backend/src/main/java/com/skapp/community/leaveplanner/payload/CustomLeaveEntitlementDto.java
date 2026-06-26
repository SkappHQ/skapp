package com.skapp.community.leaveplanner.payload;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CustomLeaveEntitlementDto {

	@NotNull
	private Long employeeId;

	@NotNull
	private Long typeId;

	@NotNull
	private float numberOfDaysOff;

	private LocalDate validFromDate;

	private LocalDate validToDate;

}
