package com.skapp.community.okrplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.okrplanner.constants.TeamObjectiveMessageConstant;
import com.skapp.community.okrplanner.mapper.TeamObjectiveMapper;
import com.skapp.community.okrplanner.payload.response.TeamObjectiveDetailedResponseDto;
import com.skapp.community.okrplanner.payload.response.TeamObjectiveResponseDto;
import com.skapp.community.okrplanner.service.TeamObjectiveService;
import com.skapp.community.okrplanner.model.TeamObjective;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.repository.TeamObjectiveRepository;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.repository.TeamDao;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamObjectiveServiceImpl implements TeamObjectiveService {

	private final TeamObjectiveRepository teamObjectiveRepository;

	private final TeamDao teamDao;

	@NonNull
	private final TeamObjectiveMapper teamObjectiveMapper;

	@Override
	public ResponseEntityDto findTeamObjectivesByTeamAndEffectiveTimePeriod(Long teamId, Long effectiveTimePeriod) {
		// Check if team is logged in users, if not return unauthorized response
		if (teamId != null) {
			Optional<Team> teamOpt = teamDao.findByTeamIdAndIsActive(teamId, true);
			if (teamOpt.isEmpty()) {
				log.error("findTeamObjectives: Team with ID {} not found or inactive", teamId);
				throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND);
			}
		}
		List<TeamObjective> objectives = teamObjectiveRepository.findByTeamIdAndEffectiveTimePeriod(teamId,
				effectiveTimePeriod);
		List<TeamObjectiveResponseDto> objectiveResponseDtos = teamObjectiveMapper
			.teamObjectivesToTeamObjectiveResponseDto(objectives);

		return new ResponseEntityDto(false, objectiveResponseDtos);
	}

	@Override
	public ResponseEntityDto findTeamObjectiveById(Long id) {
		Optional<TeamObjective> teamObjectiveOpt = teamObjectiveRepository.findById(id);
		if (teamObjectiveOpt.isEmpty()) {
			log.error("findTeamObjectiveById: Team Objective with ID {} not found", id);
			throw new ModuleException(TeamObjectiveMessageConstant.TEAM_OBJECTIVE_ERROR_OBJECTIVE_NOT_FOUND);
		}
		TeamObjectiveDetailedResponseDto teamObjectiveDetailedResponseDto = teamObjectiveMapper
			.teamObjectiveToTeamObjectiveDetailedResponseDto(teamObjectiveOpt.get());
		return new ResponseEntityDto(false, teamObjectiveDetailedResponseDto);
	}

}
