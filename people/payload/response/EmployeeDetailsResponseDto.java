package com.skapp.enterprise.people.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class EmployeeDetailsResponseDto {

	private List<EmployeeTeamDetailsResponseDto> teamSupervisors;

	private List<EmployeeManagerDetailsResponseDto> primaryManagers;

}
