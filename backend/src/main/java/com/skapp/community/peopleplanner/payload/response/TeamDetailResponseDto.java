package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class TeamDetailResponseDto {

	private Boolean isSupervisor;

	private Long teamId;

	private String teamName;

}
