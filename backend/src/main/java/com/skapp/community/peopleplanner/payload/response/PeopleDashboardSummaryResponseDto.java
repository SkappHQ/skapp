package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PeopleDashboardSummaryResponseDto {

	private Long totalEmployees;

	private Double averageEmployeeAge;

	private EmployeeHireResponseDto employeeHireResponseDto;

	private EmployeeTurnoverRateResponseDto employeeTurnoverRateResponseDto;

	private Long pendingEmployees;

}
