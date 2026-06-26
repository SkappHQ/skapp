package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class OrganizationResourceAvailabilityFilterDto {

	private LocalDate startDate;

	private LocalDate endDate;

}
