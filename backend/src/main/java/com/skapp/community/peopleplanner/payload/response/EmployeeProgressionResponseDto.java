package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.JobTitleDto;
import com.skapp.community.peopleplanner.type.EmploymentType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeProgressionResponseDto {

	private Long progressionId;

	private EmploymentType employmentType;

	private JobTitleDto jobTitle;

	private EmployeeJobFamilyDto jobFamily;

	private LocalDate startDate;

	private LocalDate endDate;

}
