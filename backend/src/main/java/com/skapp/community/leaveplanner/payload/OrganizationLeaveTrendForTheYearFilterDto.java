package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Setter
@Getter
public class OrganizationLeaveTrendForTheYearFilterDto {

	private List<Long> leaveTypeIds;

	private LocalDate startDate;

	private LocalDate endDate;

}
