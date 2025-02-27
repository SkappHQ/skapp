package com.skapp.enterprise.people.payload.response;

import com.skapp.community.peopleplanner.payload.response.TeamBasicDetailsResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EmployeeTeamDetailsResponseDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String email;

	private List<TeamBasicDetailsResponseDto> teams;

}
