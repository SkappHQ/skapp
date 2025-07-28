package com.skapp.community.okrplanner.service;

import com.skapp.community.okrplanner.payload.ResponseEntityDto;
import com.skapp.community.okrplanner.model.TeamObjective;
import java.util.List;

public interface TeamObjectiveService {

	ResponseEntityDto<List<TeamObjective>> findTeamObjectivesByTeamAndEffectiveTimePeriod(Long teamId,
			Long effectiveTimePeriod);

}
