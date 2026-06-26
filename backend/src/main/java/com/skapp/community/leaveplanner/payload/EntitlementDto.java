package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EntitlementDto {

	private Long leaveTypeId;

	private Float totalDaysAllocated;

	private String name;

	private LocalDate validFrom;

	private LocalDate validTo;

}
