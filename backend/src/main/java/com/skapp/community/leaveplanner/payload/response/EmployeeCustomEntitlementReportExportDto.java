package com.skapp.community.leaveplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeCustomEntitlementReportExportDto {

	private Long employeeId;

	private String employeeName;

	private String teams;

	private String leaveType;

	private Float days;

	private LocalDate startDate;

	private LocalDate endDate;

}
