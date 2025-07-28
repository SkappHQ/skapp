package com.skapp.community.okrplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.model.TeamObjective;
import com.skapp.community.okrplanner.payload.response.TeamObjectiveResponseDto;

import java.util.List;

public interface TeamObjectiveService {

	ResponseEntityDto findTeamObjectivesByTeamAndEffectiveTimePeriod(Long teamId,
																									 Long effectiveTimePeriod);

}
