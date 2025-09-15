package com.skapp.community.okrplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class KeyResultResponseDto {

	private Long id;

	private String title;

	private String type;

	private Double lowerLimit;

	private Double upperLimit;

	private List<AssignedTeamResponseDto> assignedTeams;

}
