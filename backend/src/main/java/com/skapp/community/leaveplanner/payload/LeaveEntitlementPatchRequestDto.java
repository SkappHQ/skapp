package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LeaveEntitlementPatchRequestDto {

	private Long leaveTypeId;

	private Float days;

	private LocalDate validFrom;

	private LocalDate validTo;

	private String reason;

	private Boolean isOverride;

	private Boolean isDeactivate;

}
