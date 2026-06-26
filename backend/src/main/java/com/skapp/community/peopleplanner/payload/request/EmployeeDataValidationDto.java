package com.skapp.community.peopleplanner.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class EmployeeDataValidationDto {

	@NotNull
	private String workEmail;

	@NotNull
	private String identificationNo;

}
