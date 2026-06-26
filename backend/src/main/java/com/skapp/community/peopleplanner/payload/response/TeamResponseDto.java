package com.skapp.community.peopleplanner.payload.response;

import lombok.Data;

import java.util.List;

@Data
public class TeamResponseDto {

	private Long teamId;

	private String teamName;

	private List<EmployeeTeamResponseDto> employees;

}
