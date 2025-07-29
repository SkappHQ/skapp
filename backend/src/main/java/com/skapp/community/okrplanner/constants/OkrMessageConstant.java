package com.skapp.community.okrplanner.constants;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OkrMessageConstant implements MessageConstant {

	TEAM_OBJECTIVE_ERROR_OBJECTIVE_NOT_FOUND("api.error.okr.team.objective.not.found");

	private final String messageKey;

}
