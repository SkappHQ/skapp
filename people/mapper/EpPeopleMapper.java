package com.skapp.enterprise.people.mapper;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeProgression;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeProgressionsDto;
import com.skapp.community.peopleplanner.payload.response.TeamBasicDetailsResponseDto;
import com.skapp.enterprise.people.model.EmployeeTimeline;
import com.skapp.enterprise.people.payload.response.EmployeeManagerDetailsResponseDto;
import com.skapp.enterprise.people.payload.response.EmployeeTeamDetailsResponseDto;
import com.skapp.enterprise.people.payload.response.EpEmployeeTimelineResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EpPeopleMapper {

	@Mapping(target = "email", source = "user.email")
	EmployeeManagerDetailsResponseDto employeeToEmployeeSupervisorDetailsResponseDto(Employee supervisor);

	@Mapping(target = "email", source = "user.email")
	EmployeeTeamDetailsResponseDto employeeToEmployeeTeamDetailsResponseDto(Employee employee);

	List<EpEmployeeTimelineResponseDto> employeeTimelinesToEmployeeTimelineResponseDtoList(
			List<EmployeeTimeline> employeeTimelines);

	EmployeeProgressionsDto employeeProgressionToEmployeeProgressionDto(EmployeeProgression employeeProgression);

	TeamBasicDetailsResponseDto teamToTeamBasicDetailsResponseDto(Team team);

	List<EmployeeBasicDetailsResponseDto> employeesToEmployeeBasicDetailsResponseDtos(List<Employee> employees);

	EmployeeBasicDetailsResponseDto employeeToEmployeeBasicDetailsResponseDto(Employee employee);

}
