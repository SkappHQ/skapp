package com.skapp.community.timeplanner.payload.response;

import com.skapp.community.timeplanner.payload.projection.EmployeeWorkHours;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class IndividualWorkHoursResponseDto {

	List<EmployeeWorkHours> employeeWorkHours;

	private int month;

	private String monthName;

}
