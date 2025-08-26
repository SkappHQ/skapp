package com.skapp.community.okrplanner.mapper;

import com.skapp.community.okrplanner.model.KeyResultAssignedTeam;
import com.skapp.community.okrplanner.model.KeyResults;
import com.skapp.community.okrplanner.model.TeamObjective;
import com.skapp.community.okrplanner.model.TeamObjectiveAssignedTeam;
import com.skapp.community.okrplanner.payload.response.AssignedTeamResponseDto;
import com.skapp.community.okrplanner.payload.response.KeyResultResponseDto;
import com.skapp.community.okrplanner.payload.response.TeamObjectiveDetailedResponseDto;
import com.skapp.community.okrplanner.payload.request.TeamObjectiveRequestDto;
import com.skapp.community.okrplanner.payload.response.TeamObjectiveResponseDto;
import com.skapp.community.okrplanner.payload.request.KeyResultRequestDto;

import com.skapp.community.okrplanner.type.KeyResultType;
import com.skapp.community.peopleplanner.model.Team;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface TeamObjectiveMapper {

	@Mapping(target = "teamObjectiveId", source = "id")
	TeamObjectiveResponseDto teamObjectiveToTeamObjectiveResponseDto(TeamObjective teamObjective);

	List<TeamObjectiveResponseDto> teamObjectivesToTeamObjectiveResponseDto(List<TeamObjective> teamObjective);

	@Mapping(target = "teamId", source = "team.teamId")
	@Mapping(target = "name", source = "team.teamName")
	AssignedTeamResponseDto teamObjectiveAssignedTeamToAssignedTeamResponseDto(
			TeamObjectiveAssignedTeam teamObjectiveAssignedTeam);

	@Mapping(target = "teamId", source = "team.teamId")
	@Mapping(target = "name", source = "team.teamName")
	AssignedTeamResponseDto keyResultAssignedTeamToAssignedTeamResponseDto(KeyResultAssignedTeam keyResultAssignedTeam);

	@Mapping(target = "id", source = "keyResultId")
	KeyResultResponseDto keyResultsToKeyResultResponseDto(KeyResults keyResult);

	@Mapping(target = "teamObjectiveId", source = "id")
	TeamObjectiveDetailedResponseDto teamObjectiveToTeamObjectiveDetailedResponseDto(TeamObjective teamObjective);

	default TeamObjective toEntity(TeamObjectiveRequestDto dto) {
		if (dto == null)
			return null;
		TeamObjective entity = new TeamObjective();
		entity.setTitle(dto.getTitle());
		entity.setEffectiveTimePeriod(dto.getEffectiveTimePeriod());
		entity.setDuration(dto.getDuration());
		// TODO: Map companyObjectiveId once company objectives feature is implemented.

		if (dto.getAssignedTeamIds() != null) {
			List<TeamObjectiveAssignedTeam> assignedTeams = dto.getAssignedTeamIds().stream().map(teamId -> {
				TeamObjectiveAssignedTeam tat = new TeamObjectiveAssignedTeam();
				Team team = new Team();
				team.setTeamId(teamId);
				tat.setTeam(team);
				tat.setTeamObjective(entity);
				return tat;
			}).collect(Collectors.toList());
			entity.setAssignedTeams(assignedTeams);
		}
		if (dto.getKeyResults() != null) {
			List<KeyResults> keyResults = dto.getKeyResults()
				.stream()
				.map(krDto -> mapKeyResult(krDto, entity))
				.collect(Collectors.toList());
			entity.setKeyResults(keyResults);
		}
		return entity;
	}

	default KeyResults mapKeyResult(KeyResultRequestDto krDto, TeamObjective parent) {
		KeyResults kr = new KeyResults();
		kr.setTitle(krDto.getTitle());
		kr.setType(KeyResultType.valueOf(krDto.getType()));
		kr.setLowerLimit(krDto.getLowerLimit());
		kr.setUpperLimit(krDto.getUpperLimit());
		kr.setTeamObjective(parent);
		if (krDto.getAssignedTeamIds() != null) {
			List<KeyResultAssignedTeam> assignedTeams = krDto.getAssignedTeamIds().stream().map(teamId -> {
				KeyResultAssignedTeam krat = new KeyResultAssignedTeam();
				Team team = new Team();
				team.setTeamId(teamId);
				krat.setTeam(team);
				krat.setKeyResults(kr);
				return krat;
			}).collect(Collectors.toList());
			kr.setAssignedTeams(assignedTeams);
		}
		return kr;
	}

}
