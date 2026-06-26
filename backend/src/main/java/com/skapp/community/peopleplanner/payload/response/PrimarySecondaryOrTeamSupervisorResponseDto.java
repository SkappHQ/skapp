package com.skapp.community.peopleplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PrimarySecondaryOrTeamSupervisorResponseDto {

	private Boolean isPrimaryManager;

	private Boolean isSecondaryManager;

	private Boolean isTeamSupervisor;

}
