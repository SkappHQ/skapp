package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EmployeeTransferableTeamsResponseDto {

	private Long employeeId;

	private List<TeamBasicDetailsResponseDto> transferableTeams;

}
