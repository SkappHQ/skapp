package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.TeamPatchRequestDto;
import com.skapp.community.peopleplanner.payload.request.TeamRequestDto;
import com.skapp.community.peopleplanner.payload.request.TeamsRequestDto;
import com.skapp.community.peopleplanner.payload.request.TransferTeamMembersDto;

import java.util.List;

public interface TeamService {

	ResponseEntityDto addNewTeam(TeamRequestDto teamRequestDto);

	ResponseEntityDto getAllTeamDetails();

	ResponseEntityDto updateTeam(Long id, TeamPatchRequestDto teamPatchRequestDto);

	ResponseEntityDto getTeamByTeamId(Long id);

	ResponseEntityDto addTeams(TeamsRequestDto teamsRequestDto);

	ResponseEntityDto transferMembersAndDeleteTeam(Long id, List<TransferTeamMembersDto> transferTeamMembersDtoList);

	ResponseEntityDto getManagerTeams();

	ResponseEntityDto getTeamsForCurrentUser();

}
