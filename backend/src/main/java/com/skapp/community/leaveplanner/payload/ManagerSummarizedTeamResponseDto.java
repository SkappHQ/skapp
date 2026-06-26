package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ManagerSummarizedTeamResponseDto {

	private Long teamId;

	private String teamName;

	private List<EmployeeSummarizedTeamResponseDto> employees;

}
