package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeSummarizedTeamResponseDto {

	private EmployeeSummarizedResponseDto employee;

	private Boolean isSupervisor;

}
