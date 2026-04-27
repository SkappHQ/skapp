package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@Getter
@Setter
public class TeamSupervisorTransferItemDto {

	@NonNull
	private Long teamId;

	@NonNull
	private Long newSupervisorId;

}
