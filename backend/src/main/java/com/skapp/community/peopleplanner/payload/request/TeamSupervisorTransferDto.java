package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamSupervisorTransferDto {

	private Long teamId;

	private Long newTeamSupervisorId;

}
