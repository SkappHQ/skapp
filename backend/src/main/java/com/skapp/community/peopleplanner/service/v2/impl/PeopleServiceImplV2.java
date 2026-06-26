package com.skapp.community.peopleplanner.service.v2.impl;

import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.request.EmployeeFilterDtoV2;
import com.skapp.community.peopleplanner.payload.response.EmployeeDirectoryResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeDirectoryTeamResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeManagerResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.service.v2.PeopleServiceV2;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PeopleServiceImplV2 implements PeopleServiceV2 {

	private final PageTransformer pageTransformer;

	private final EmployeeDao employeeDao;

	@Override
	public ResponseEntityDto getEmployees(EmployeeFilterDtoV2 employeeFilterDto) {
		log.debug("getEmployees: execution started");

		Pageable pageable = PageRequest.of(employeeFilterDto.getPage(), employeeFilterDto.getSize(),
				Sort.by(employeeFilterDto.getSortOrder(), employeeFilterDto.getSortKey().name()));

		Page<Employee> employees = employeeDao.findEmployeesV2(employeeFilterDto, pageable);
		List<EmployeeDirectoryResponseDto> responseDtos = employees.getContent()
			.stream()
			.map(this::mapToEmployeeDirectoryResponseDto)
			.toList();

		PageDto pageDto = pageTransformer.transform(employees);
		pageDto.setItems(responseDtos);

		log.debug("getEmployees: execution completed");
		return new ResponseEntityDto(false, pageDto);
	}

	private EmployeeDirectoryResponseDto mapToEmployeeDirectoryResponseDto(Employee employee) {
		EmployeeDirectoryResponseDto dto = new EmployeeDirectoryResponseDto();
		dto.setEmployeeId(employee.getEmployeeId());
		dto.setFirstName(employee.getFirstName());
		dto.setLastName(employee.getLastName());
		dto.setAuthPic(employee.getAuthPic());
		dto.setJobFamily(employee.getJobFamily() != null ? employee.getJobFamily().getName() : null);
		dto.setJobTitle(employee.getJobTitle() != null ? employee.getJobTitle().getName() : null);
		dto.setEmail(employee.getUser().getEmail());
		dto.setIsActive(employee.getUser().getIsActive());
		dto.setAccountStatus(employee.getAccountStatus());

		if (employee.getEmployeeManagers() != null) {
			List<EmployeeManagerResponseDto> managers = employee.getEmployeeManagers().stream().map(em -> {
				Employee manager = em.getManager();
				EmployeeManagerResponseDto managerDto = new EmployeeManagerResponseDto();
				managerDto.setEmployeeId(manager.getEmployeeId());
				managerDto.setFirstName(manager.getFirstName());
				managerDto.setLastName(manager.getLastName());
				managerDto.setMiddleName(manager.getMiddleName());
				managerDto.setAuthPic(manager.getAuthPic());
				managerDto.setIsPrimaryManager(em.getIsPrimaryManager());
				managerDto.setManagerType(em.getManagerType());
				return managerDto;
			}).toList();
			dto.setManagers(managers);
		}

		if (employee.getEmployeeTeams() != null) {
			List<EmployeeDirectoryTeamResponseDto> teams = employee.getEmployeeTeams().stream().map(et -> {
				Team team = et.getTeam();
				EmployeeDirectoryTeamResponseDto teamDto = new EmployeeDirectoryTeamResponseDto();
				teamDto.setTeamId(team.getTeamId());
				teamDto.setTeamName(team.getTeamName());
				return teamDto;
			}).toList();
			dto.setTeams(teams);
		}

		return dto;
	}

}
