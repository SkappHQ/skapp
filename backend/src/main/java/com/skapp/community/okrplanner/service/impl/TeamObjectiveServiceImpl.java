package com.skapp.community.okrplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
<<<<<<< HEAD
import com.skapp.community.okrplanner.constants.OkrMessageConstant;
=======
import com.skapp.community.okrplanner.constant.OkrMessageConstant;
>>>>>>> 6e1d7dd195c3a027e624a58ee1d26dce29b741fd
import com.skapp.community.okrplanner.mapper.TeamObjectiveMapper;
import com.skapp.community.okrplanner.payload.request.KeyResultRequestDto;
import com.skapp.community.okrplanner.payload.request.TeamObjectiveRequestDto;
import com.skapp.community.okrplanner.payload.response.TeamObjectiveDetailedResponseDto;
import com.skapp.community.okrplanner.payload.response.TeamObjectiveResponseDto;
import com.skapp.community.okrplanner.service.TeamObjectiveService;
import com.skapp.community.okrplanner.model.TeamObjective;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.repository.TeamObjectiveRepository;
import com.skapp.community.okrplanner.type.KeyResultType;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.repository.TeamDao;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamObjectiveServiceImpl implements TeamObjectiveService {

	private final TeamObjectiveRepository teamObjectiveRepository;

	private final TeamDao teamDao;

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
			throw new ModuleException(OkrMessageConstant.TEAM_OBJECTIVE_ERROR_OBJECTIVE_NOT_FOUND);
		}
		TeamObjectiveDetailedResponseDto teamObjectiveDetailedResponseDto = teamObjectiveMapper
			.teamObjectiveToTeamObjectiveDetailedResponseDto(teamObjectiveOpt.get());
		return new ResponseEntityDto(false, teamObjectiveDetailedResponseDto);
	}

<<<<<<< HEAD
=======
	@Override
	@Transactional
	public ResponseEntityDto createTeamObjective(TeamObjectiveRequestDto requestDto) {
		validateAssignedTeams(requestDto.getAssignedTeamIds());
		validateKeyResults(requestDto.getKeyResults(), requestDto.getAssignedTeamIds());

		TeamObjective teamObjective = teamObjectiveMapper.toEntity(requestDto);

		teamObjective.getAssignedTeams().forEach(assigned -> {
			Long teamId = assigned.getTeam().getTeamId();
			Team team = teamDao.findByTeamIdAndIsActive(teamId, true)
				.orElseThrow(() -> new ModuleException(OkrMessageConstant.TEAM_OBJECTIVE_ERROR_NO_TEAMS_ASSIGNED));
			assigned.setTeam(team);
		});

		if (teamObjective.getKeyResults() != null) {
			teamObjective.getKeyResults().forEach(kr -> {
				if (kr.getAssignedTeams() != null) {
					kr.getAssignedTeams().forEach(krat -> {
						Long teamId = krat.getTeam().getTeamId();
						Team team = teamDao.findByTeamIdAndIsActive(teamId, true)
							.orElseThrow(() -> new ModuleException(
									OkrMessageConstant.TEAM_OBJECTIVE_ERROR_NO_TEAMS_ASSIGNED));
						krat.setTeam(team);
					});
				}
			});
		}

		teamObjectiveRepository.save(teamObjective);
		return new ResponseEntityDto(false, "Team Objective created successfully");
	}

	private void validateAssignedTeams(List<Long> teamIds) {
		if (teamIds == null || teamIds.isEmpty()) {
			throw new ModuleException(OkrMessageConstant.TEAM_OBJECTIVE_ERROR_NO_TEAMS_ASSIGNED);
		}
		Set<Long> seen = new HashSet<>();
		for (Long id : teamIds) {
			if (!seen.add(id)) {
				throw new ModuleException(OkrMessageConstant.TEAM_OBJECTIVE_ERROR_DUPLICATE_TEAM_ID);
			}
			teamDao.findByTeamIdAndIsActive(id, true)
				.orElseThrow(() -> new ModuleException(OkrMessageConstant.TEAM_OBJECTIVE_ERROR_NO_TEAMS_ASSIGNED));
		}
	}

	private void validateKeyResults(List<KeyResultRequestDto> keyResults, List<Long> parentAssignedTeamIds) {
		for (KeyResultRequestDto kr : keyResults) {
			String type = kr.getType();

			KeyResultType keyResultType;
			try {
				keyResultType = KeyResultType.valueOf(type);
			}
			catch (IllegalArgumentException ex) {
				throw new ModuleException(OkrMessageConstant.TEAM_OBJECTIVE_ERROR_INVALID_KEY_RESULT_TYPE);
			}

			switch (keyResultType) {
				case GREATER_THAN:
					if (kr.getLowerLimit() == null || kr.getUpperLimit() != null) {
						throw new ModuleException(OkrMessageConstant.TEAM_OBJECTIVE_ERROR_INVALID_KEY_RESULT_LIMITS);
					}
					break;
				case LESS_THAN:
					if (kr.getUpperLimit() == null || kr.getLowerLimit() != null) {
						throw new ModuleException(OkrMessageConstant.TEAM_OBJECTIVE_ERROR_INVALID_KEY_RESULT_LIMITS);
					}
					break;
				case IN_BETWEEN:
					if (kr.getLowerLimit() == null || kr.getUpperLimit() == null
							|| kr.getLowerLimit() >= kr.getUpperLimit()) {
						throw new ModuleException(OkrMessageConstant.TEAM_OBJECTIVE_ERROR_INVALID_KEY_RESULT_LIMITS);
					}
					break;
			}

			if (kr.getAssignedTeamIds() != null) {
				for (Long teamId : kr.getAssignedTeamIds()) {
					if (!parentAssignedTeamIds.contains(teamId)) {
						throw new ModuleException(
								OkrMessageConstant.TEAM_OBJECTIVE_ERROR_INVALID_ASSIGNED_TEAM_FOR_KEY_RESULT);
					}
				}
			}

			validateAssignedTeams(kr.getAssignedTeamIds());
		}
	}

>>>>>>> 6e1d7dd195c3a027e624a58ee1d26dce29b741fd
}
