package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.type.EmploymentType;
import com.skapp.community.peopleplanner.util.deserializer.EmployeeTypeDeserializer;
import lombok.Getter;
import lombok.Setter;
import tools.jackson.databind.annotation.JsonDeserialize;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeProgressionsDto {

	private Long progressionId;

	@JsonDeserialize(using = EmployeeTypeDeserializer.class)
	private EmploymentType employmentType;

	private Long jobFamilyId;

	private Long jobTitleId;

	private LocalDate startDate;

	private LocalDate endDate;

	private Boolean isCurrent = false;

}
