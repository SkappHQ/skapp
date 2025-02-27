package com.skapp.enterprise.people.mapper;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import com.skapp.community.peopleplanner.payload.response.TeamBasicDetailsResponseDto;
import com.skapp.enterprise.people.payload.response.EmployeeManagerDetailsResponseDto;
import com.skapp.enterprise.people.payload.response.EmployeeTeamDetailsResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EpPeopleMapper {

	@Mapping(target = "email", source = "user.email")
	EmployeeManagerDetailsResponseDto employeeToEmployeeSupervisorDetailsResponseDto(Employee supervisor);

	@Mapping(target = "email", source = "user.email")
	EmployeeTeamDetailsResponseDto employeeToEmployeeTeamDetailsResponseDto(Employee employee);

	EmployeeBasicDetailsResponseDto employeeToEmployeeBasicDetailsResponseDto(Employee employee);

	TeamBasicDetailsResponseDto teamToTeamBasicDetailsResponseDto(Team team);

}
