package com.skapp.community.peopleplanner.payload.request.employee.employment;

import com.skapp.community.peopleplanner.type.EEO;
import com.skapp.community.peopleplanner.type.Ethnicity;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeEmploymentIdentificationAndDiversityDetailsDto {

	private String ssn;

	private Ethnicity ethnicity;

	private EEO eeoJobCategory;

}
