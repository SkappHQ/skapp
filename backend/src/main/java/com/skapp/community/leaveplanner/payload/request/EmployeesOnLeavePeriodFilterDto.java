package com.skapp.community.leaveplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class EmployeesOnLeavePeriodFilterDto {

	private LocalDate startDate;

	private LocalDate endDate;

	private List<Long> teamIds;

}
