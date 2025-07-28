package com.skapp.community.okrplanner.mapper;

import com.skapp.community.okrplanner.model.TeamObjective;
import com.skapp.community.okrplanner.payload.response.TeamObjectiveResponseDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TeamObjectiveMapper {

    List<TeamObjectiveResponseDto> teamObjectivesToTeamObjectiveResponseDto(List<TeamObjective> teamObjective);
}
