package com.skapp.community.okrplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.payload.request.TeamObjectiveRequestDto;

public interface TeamObjectiveService {

	ResponseEntityDto findTeamObjectivesByTeamAndEffectiveTimePeriod(Long teamId, Long effectiveTimePeriod);

	ResponseEntityDto findTeamObjectiveById(Long id);

	ResponseEntityDto createTeamObjective(TeamObjectiveRequestDto requestDto);

}
