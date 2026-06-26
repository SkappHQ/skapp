package com.skapp.community.leaveplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SummarizedLeaveEntitlementBalanceDto {

	private LocalDate validFrom;

	private LocalDate validTo;

	private Float totalDaysAllocated;

	private Float totalDaysUsed;

}
