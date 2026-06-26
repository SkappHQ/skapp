package com.skapp.community.timeplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeAttendanceSummaryFilterDto {

	private LocalDate startDate;

	private LocalDate endDate;

}
