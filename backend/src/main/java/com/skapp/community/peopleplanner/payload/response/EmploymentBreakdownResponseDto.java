package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class EmploymentBreakdownResponseDto {

	EmploymentTypesResponseDto employmentTypesResponseDto;

	EmploymentAllocationResponseDto employmentAllocationResponseDto;

}
