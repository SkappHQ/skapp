package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SupervisorRolesResponseDto {

	private List<EmployeeBasicDetailsResponseDto> supervisedEmployees;

	private List<TeamBasicDetailsResponseDto> supervisedTeams;

}
