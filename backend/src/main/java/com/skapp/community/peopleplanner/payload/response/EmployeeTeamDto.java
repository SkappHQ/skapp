package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.model.Team;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmployeeTeamDto {

	private Long employeeId;

	private Team team;

}
