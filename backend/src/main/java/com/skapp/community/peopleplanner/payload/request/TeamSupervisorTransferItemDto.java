package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamSupervisorTransferItemDto {

	private Long teamId;

	private Long newSupervisorId;

}
