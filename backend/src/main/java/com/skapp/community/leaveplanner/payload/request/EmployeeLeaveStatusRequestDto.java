package com.skapp.community.leaveplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class EmployeeLeaveStatusRequestDto {

	private LocalDate date;

	private List<Long> employeeIds;

}
