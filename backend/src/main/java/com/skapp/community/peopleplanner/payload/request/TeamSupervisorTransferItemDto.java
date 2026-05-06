package com.skapp.community.peopleplanner.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamSupervisorTransferItemDto {

	@NotNull
	private Long teamId;

	@NotNull
	private Long newSupervisorId;

}
