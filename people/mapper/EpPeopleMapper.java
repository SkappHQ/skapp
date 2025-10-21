package com.skapp.enterprise.people.mapper;

import com.skapp.community.common.model.User;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeProgression;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentCareerProgressionDetailsDto;
import com.skapp.community.peopleplanner.payload.response.TeamBasicDetailsResponseDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseWithLangDto;
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

	EmployeeEmploymentCareerProgressionDetailsDto employeeProgressionToEmployeeProgressionDto(
			EmployeeProgression employeeProgression);

	TeamBasicDetailsResponseDto teamToTeamBasicDetailsResponseDto(Team team);

	List<EmployeeBasicDetailsResponseDto> employeesToEmployeeBasicDetailsResponseDtos(List<Employee> employees);

	EmployeeBasicDetailsResponseDto employeeToEmployeeBasicDetailsResponseDto(Employee employee);

	@Mapping(target = "date", source = "createdDate", dateFormat = "yyyy-MM-dd")
	@Mapping(target = "recordedBy",
			expression = "java(employeeTimeline.getRecordedBy() != null ? employeeTimeline.getRecordedBy().getFullName() : null)")
	EpEmployeeTimelineResponseDto employeeTimelineToEmployeeTimelineResponseDto(EmployeeTimeline employeeTimeline);

	EpUserResponseWithLangDto userToEpUserResponseWithLangDto(User currentUser);

}
