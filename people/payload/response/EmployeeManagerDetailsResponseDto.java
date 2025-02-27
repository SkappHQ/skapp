package com.skapp.enterprise.people.payload.response;

import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@EqualsAndHashCode
public class EmployeeManagerDetailsResponseDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String email;

	private List<EmployeeBasicDetailsResponseDto> supervisedEmployees;

}
