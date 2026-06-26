package com.skapp.community.peopleplanner.payload.request.employee.employment;

import com.skapp.community.peopleplanner.type.EmploymentType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeEmploymentCareerProgressionDetailsDto {

	private Long progressionId;

	private EmploymentType employmentType;

	private Long jobFamilyId;

	private Long jobTitleId;

	private LocalDate startDate;

	private LocalDate endDate;

	private Boolean isCurrentEmployment;

}
