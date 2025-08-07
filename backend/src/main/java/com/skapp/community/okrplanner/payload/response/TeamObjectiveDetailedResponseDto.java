package com.skapp.community.okrplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TeamObjectiveDetailedResponseDto {

	private Long teamObjectiveId;

	private String title;

	private Long effectiveTimePeriod;

	private String duration;

	private List<KeyResultResponseDto> keyResults;

	private List<AssignedTeamResponseDto> assignedTeams;

}
