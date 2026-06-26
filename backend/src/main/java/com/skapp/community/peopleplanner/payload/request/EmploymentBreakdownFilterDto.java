package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.type.EmploymentBreakdownTypes;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class EmploymentBreakdownFilterDto {

	private List<Long> teams;

	private EmploymentBreakdownTypes employmentBreakdownTypes = EmploymentBreakdownTypes.TYPES;

}
