package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SupervisorRolesResponseDto {

	private List<SupervisedEmployeeResponseDto> supervisedEmployees;

	private List<SupervisedTeamResponseDto> supervisedTeams;

}
