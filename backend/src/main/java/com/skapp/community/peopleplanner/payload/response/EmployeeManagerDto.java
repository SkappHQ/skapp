package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.model.Employee;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmployeeManagerDto {

	private Long employeeId;

	private Employee managers;

}
