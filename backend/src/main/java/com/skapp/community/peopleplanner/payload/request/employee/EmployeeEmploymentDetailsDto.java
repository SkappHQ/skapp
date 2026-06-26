package com.skapp.community.peopleplanner.payload.request.employee;

import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentBasicDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentCareerProgressionDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentIdentificationAndDiversityDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentPreviousEmploymentDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentVisaDetailsDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EmployeeEmploymentDetailsDto {

	private EmployeeEmploymentBasicDetailsDto employmentDetails;

	private List<EmployeeEmploymentCareerProgressionDetailsDto> careerProgression;

	private EmployeeEmploymentIdentificationAndDiversityDetailsDto identificationAndDiversityDetails;

	private List<EmployeeEmploymentPreviousEmploymentDetailsDto> previousEmployment;

	private List<EmployeeEmploymentVisaDetailsDto> visaDetails;

}
