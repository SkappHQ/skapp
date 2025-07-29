package com.skapp.community.okrplanner.mapper;

import com.skapp.community.okrplanner.model.TeamObjective;
import com.skapp.community.okrplanner.payload.response.TeamObjectiveResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TeamObjectiveMapper {

    @Mapping(target = "teamObjectiveId", source = "id")
    TeamObjectiveResponseDto teamObjectiveToTeamObjectiveResponseDto(TeamObjective teamObjective);

    List<TeamObjectiveResponseDto> teamObjectivesToTeamObjectiveResponseDto(List<TeamObjective> teamObjective);
}
