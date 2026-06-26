package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class JobTitleResponseDetailDto {

	private Long jobTitleId;

	private String name;

	private List<EmployeeJobFamilyResponseDto> employees;

}
