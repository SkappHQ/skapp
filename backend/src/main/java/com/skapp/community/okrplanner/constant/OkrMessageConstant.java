package com.skapp.community.okrplanner.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OkrMessageConstant implements MessageConstant {

	TEAM_OBJECTIVE_ERROR_OBJECTIVE_NOT_FOUND("api.error.okr.team.objective.not.found"),
	TEAM_OBJECTIVE_ERROR_DUPLICATE_TEAM_ID("api.error.okr.team.duplicate-team-id"),
	TEAM_OBJECTIVE_ERROR_INVALID_ASSIGNED_TEAM_FOR_KEY_RESULT(
			"api.error.okr.team.invalid-assigned-team-for-key-result"),
	TEAM_OBJECTIVE_ERROR_INVALID_KEY_RESULT_LIMITS("api.error.okr.team.invalid-key-result-limits"),
	TEAM_OBJECTIVE_ERROR_INVALID_KEY_RESULT_TYPE("api.error.okr.team.invalid-key-result-type"),
	TEAM_OBJECTIVE_ERROR_NO_TEAMS_ASSIGNED("api.error.okr.team.no-teams-assigned");

	private final String messageKey;

}
