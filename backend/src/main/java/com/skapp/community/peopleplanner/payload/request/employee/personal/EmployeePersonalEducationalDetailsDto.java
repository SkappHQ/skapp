package com.skapp.community.peopleplanner.payload.request.employee.personal;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeePersonalEducationalDetailsDto {

	private Long educationId;

	private String institutionName;

	private String degree;

	private String major;

	private LocalDate startDate;

	private LocalDate endDate;

}
