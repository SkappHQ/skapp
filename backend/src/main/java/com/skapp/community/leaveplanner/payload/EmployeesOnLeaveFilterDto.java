package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class EmployeesOnLeaveFilterDto {

	private LocalDate date;

	private List<Long> teamIds;

}
