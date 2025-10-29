package com.skapp.community.okrplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamObjectiveResponseDto {

	private Long teamObjectiveId;

	private String title;

	private Long effectiveTimePeriod;

	private String duration;

	// TODO: Add company objective id when available

}
