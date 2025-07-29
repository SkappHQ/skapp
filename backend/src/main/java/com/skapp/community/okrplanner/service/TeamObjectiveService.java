package com.skapp.community.okrplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;

public interface TeamObjectiveService {

	ResponseEntityDto findTeamObjectivesByTeamAndEffectiveTimePeriod(Long teamId, Long effectiveTimePeriod);

	ResponseEntityDto findTeamObjectiveById(Long id);

}
