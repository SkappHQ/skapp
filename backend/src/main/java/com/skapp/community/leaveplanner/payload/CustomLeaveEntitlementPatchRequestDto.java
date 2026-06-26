package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CustomLeaveEntitlementPatchRequestDto {

	private Long employeeId;

	private Long typeId;

	private Float numberOfDaysOff;

	private LocalDate validFromDate;

	private LocalDate validToDate;

}
