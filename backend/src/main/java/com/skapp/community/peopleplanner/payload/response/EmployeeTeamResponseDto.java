package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.Data;

@Data
public class EmployeeTeamResponseDto {

	private EmployeeBasicDetailsResponseDto employee;

	private Boolean isSupervisor;

}
