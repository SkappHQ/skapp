package com.skapp.community.peopleplanner.payload.request.employee.employment;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeEmploymentPreviousEmploymentDetailsDto {

	private Long employmentId;

	private String companyName;

	private String jobTitle;

	private LocalDate startDate;

	private LocalDate endDate;

}
