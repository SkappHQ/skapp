package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.request.TeamPatchRequestDto;
import com.skapp.community.peopleplanner.payload.request.TeamRequestDto;
import com.skapp.community.peopleplanner.payload.request.TeamsRequestDto;
import com.skapp.community.peopleplanner.payload.request.TransferTeamMembersDto;
import com.skapp.community.peopleplanner.payload.response.TeamBasicDetailsResponseDto;
import com.skapp.community.peopleplanner.payload.response.TeamResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeTeamDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.service.TeamService;
import com.skapp.community.timeplanner.util.TimeUtil;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamServiceImpl implements TeamService {

	@NonNull
	private final PeopleMapper peopleMapper;

	@NonNull
	private final EmployeeDao employeeDao;

	@NonNull
	private final TeamDao teamDao;

	@NonNull
	private final EmployeeTeamDao employeeTeamDao;

	@NonNull
	private final UserService userService;

	@NonNull
	private final MessageUtil messageUtil;

	@Override
	public ResponseEntityDto addNewTeam(TeamRequestDto teamRequestDto) {
		log.info("addNewTeam: execution started");
		Team team = peopleMapper.teamRequestDtoToTeam(teamRequestDto);
		if (teamNameCheck(team.getTeamName())) {
			log.error("Team name already exists");
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NAME_ALREADY_EXISTS);
		}
		Set<Long> teamSupervisorIds = teamRequestDto.getTeamSupervisors();
		if (TimeUtil.isTeamSupervisorCountValid(teamSupervisorIds.stream().toList())) {
			log.error("Team has more than 3 supervisors");
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_SUPERVISOR_COUNT_MORE_THAN_THREE);
		}
		List<Employee> teamSupervisors = employeeDao.findAllById(teamSupervisorIds);

		if (teamSupervisorIds.size() != teamSupervisors.size()) {
			log.error("Team supervisor ID(s) are not valid");
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_SUPERVISOR_IDS_NOT_VALID);
		}

		List<EmployeeTeam> employeeTeamSet = new ArrayList<>();
		setEmployeeTeam(employeeTeamSet, teamSupervisors, team, true);

		Set<Long> memberIds = teamRequestDto.getTeamMembers();
		List<Employee> teamMembers = employeeDao.findAllById(memberIds);

		if (memberIds.size() != teamMembers.size()) {
			log.error("Team member ID(s) are not valid");
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_MEMBER_IDS_NOT_VALID);
		}

		if (new HashSet<>(teamMembers).containsAll(teamSupervisors)) {
			teamMembers.removeAll(teamSupervisors);
		}
		setEmployeeTeam(employeeTeamSet, teamMembers, team, false);
		team.setEmployees(employeeTeamSet);
		teamDao.save(team);

		log.info("addNewTeam: execution successfully finished by saving team : {}", team.getTeamId());
		return new ResponseEntityDto(false, peopleMapper.teamToTeamResponseDto(team));
	}

	@Override
	public ResponseEntityDto getAllTeamDetails() {
		log.info("getAllTeamDetails: execution started");

		List<Team> teams = teamDao.findByIsActive(true);
		List<TeamResponseDto> response = peopleMapper.teamListToTeamResponseDtoList(teams);

		log.info("getAllTeamDetails: Successfully finished");
		return new ResponseEntityDto(false, response);
	}

	@Transactional
	@Override
	public ResponseEntityDto updateTeam(Long id, TeamPatchRequestDto teamPatchRequestDto) {
		log.info("updateTeam: execution started");
		Optional<Team> teamOpt = teamDao.findByTeamIdAndIsActive(id, true);
		if (teamOpt.isPresent()) {
			Team team = teamOpt.get();

			if (!Objects.equals(team.getTeamName(), teamPatchRequestDto.getTeamName())) {
				if (teamNameCheck(teamPatchRequestDto.getTeamName())) {
					log.error("updateTeam: Team name already exists");
					throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NAME_ALREADY_EXISTS);
				}
				team.setTeamName(teamPatchRequestDto.getTeamName());
			}

			List<Long> teamSupervisorIds = teamPatchRequestDto.getTeamSupervisors();
			if (TimeUtil.isTeamSupervisorCountValid(teamSupervisorIds.stream().toList())) {
				log.error("updateTeam: Team has more than 3 supervisors");
				throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_SUPERVISOR_COUNT_MORE_THAN_THREE);
			}
			List<Long> updatedTeamMemberIds = teamPatchRequestDto.getTeamMembers();
			List<Long> existingSupervisorIds = teamDao.findSupervisorIdsByTeamId(id);
			List<Long> existingMemberAndSupervisorIds = teamDao.findMemberIdsByTeamId(id);
			List<Long> existingMemberIds = existingMemberAndSupervisorIds.stream()
				.filter(e -> !existingSupervisorIds.contains(e))
				.toList();

			List<EmployeeTeam> employeeTeamSet = new ArrayList<>();
			List<Long> supervisorIdsToBeAdded = teamSupervisorIds.stream()
				.filter(e -> !existingSupervisorIds.contains(e))
				.toList();
			List<Employee> supervisorsToBeAdded;
			supervisorsToBeAdded = employeeDao.findAllById(supervisorIdsToBeAdded);
			setEmployeeTeam(employeeTeamSet, supervisorsToBeAdded, team, true);

			List<Long> memberIdsToBeAdded = updatedTeamMemberIds.stream()
				.filter(e -> !existingMemberIds.contains(e))
				.toList();
			List<Employee> membersToBeAdded = employeeDao.findAllById(memberIdsToBeAdded);
			setEmployeeTeam(employeeTeamSet, membersToBeAdded, team, false);

			List<Long> supervisorIdsToBeRemoved = existingSupervisorIds.stream()
				.filter(e -> !teamSupervisorIds.contains(e))
				.toList();
			List<Long> memberIdsToBeRemoved = existingMemberIds.stream()
				.filter(e -> !updatedTeamMemberIds.contains(e))
				.toList();
			List<EmployeeTeam> employeeTeamsTobeRemoved = new ArrayList<>();
			if (!supervisorIdsToBeRemoved.isEmpty()) {
				List<EmployeeTeam> removingSupervisors = teamDao.findSupervisorTeamsByTeamId(id,
						supervisorIdsToBeRemoved);
				employeeTeamsTobeRemoved.addAll(removingSupervisors);
			}
			if (!memberIdsToBeRemoved.isEmpty()) {
				List<EmployeeTeam> removingMembers = teamDao.findMemberTeamsByTeamId(id, memberIdsToBeRemoved);
				employeeTeamsTobeRemoved.addAll(removingMembers);
			}

			team.setEmployees(employeeTeamSet);
			employeeTeamDao.deleteAllInBatch(employeeTeamsTobeRemoved);
			teamDao.save(team);

			log.info("updateTeam: execution successfully finished by updating team : {}", team.getTeamId());
			return new ResponseEntityDto(false, peopleMapper.teamToTeamResponseDto(team));
		}
		else {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND);
		}
	}

	@Override
	public ResponseEntityDto getTeamByTeamId(Long id) {

		log.info("getTeamByTeamId: execution started");
		Optional<Team> team = teamDao.findByTeamIdAndIsActive(id, true);
		if (team.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND);
		}
		TeamResponseDto response = peopleMapper.teamToTeamResponseDto(team.get());

		log.info("getTeamByTeamId: Successfully finished");
		return new ResponseEntityDto(false, response);
	}

	@Override
	public ResponseEntityDto addTeams(TeamsRequestDto teamsRequestDto) {

		log.info("addTeams: execution started");
		List<Team> existingTeams = teamDao.findByTeamNameInAndIsActiveTrue(teamsRequestDto.getTeamNames());
		if (!existingTeams.isEmpty()) {
			log.error("addNewTeams: Team name(s) already exist with name(existingTeams) {}",
					existingTeams.stream().map(Team::getTeamName).toList());
		}

		List<Team> teams = teamsRequestDto.getTeamNames()
			.stream()
			.filter(teamName -> existingTeams.stream()
				.noneMatch(existingTeam -> existingTeam.getTeamName().equals(teamName)))
			.map(teamName -> {
				Team team = new Team();
				team.setTeamName(teamName);
				return team;
			})
			.toList();

		if (!teams.isEmpty())
			teamDao.saveAll(teams);

		log.info("addTeams: execution successfully finished by saving teams by adding {} team(s)", teams.size());
		return new ResponseEntityDto(false, peopleMapper.teamListToTeamResponseDtoList(teams));
	}

	@Override
	@Transactional
	public ResponseEntityDto transferMembersAndDeleteTeam(Long id,
			List<TransferTeamMembersDto> transferTeamMembersDtoList) {
		log.info("transferMembersAndDeleteTeam: execution started");
		Optional<Team> optionalTeam = teamDao.findByTeamIdAndIsActive(id, true);
		if (optionalTeam.isPresent()) {
			Team team = optionalTeam.get();

			if (transferTeamMembersDtoList.isEmpty()) {
				employeeTeamDao.deleteEmployeeTeamByTeamId(id);
			}
			else {
				Map<Long, List<TransferTeamMembersDto>> employeeActions = transferTeamMembersDtoList.stream()
					.collect(Collectors.groupingBy(TransferTeamMembersDto::getEmployeeId));

				for (Map.Entry<Long, List<TransferTeamMembersDto>> entry : employeeActions.entrySet()) {
					if (entry.getValue().size() > 1) {
						throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_DUPLICATE_EMPLOYEE_ID);
					}
				}

				List<TransferTeamMembersDto> transfersList = transferTeamMembersDtoList.stream()
					.filter(transfer -> transfer.getTeamId() != null)
					.toList();

				List<Long> employeesToUnassignIds = transferTeamMembersDtoList.stream()
					.filter(transfer -> transfer.getTeamId() == null)
					.map(TransferTeamMembersDto::getEmployeeId)
					.toList();

				if (!employeesToUnassignIds.isEmpty()) {
					employeeTeamDao.deleteEmployeeTeamByTeamIdAndEmployeeIds(id, employeesToUnassignIds);
				}

				if (!transfersList.isEmpty()) {
					transfersList = getFilteredTransferTeamMembers(transfersList, team);
					employeeTeamDao.deleteEmployeeTeamByTeamIdAndEmployeeIds(id,
							transfersList.stream().map(TransferTeamMembersDto::getEmployeeId).toList());

					List<EmployeeTeam> employeeTeamList = new ArrayList<>();
					transfersList.forEach(transfer -> setUpNewTeam(employeeTeamList, transfer));
					employeeTeamDao.saveAll(employeeTeamList);
				}
			}

			employeeTeamDao.deleteEmployeeTeamByTeamId(id);
			teamDao.deleteTeamById(id);
		}
		else {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND);
		}
		log.info("delete Team: execution ended");
		return new ResponseEntityDto(false, messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_TEAM_DELETED));
	}

	@Override
	@Transactional
	public ResponseEntityDto getManagerTeams() {
		log.info("getManagerTeams: execution started");

		User currentUser = userService.getCurrentUser();
		List<Team> teams;

		if (Boolean.TRUE.equals(currentUser.getEmployee().getEmployeeRole().getIsSuperAdmin())) {
			teams = teamDao.findByIsActive(true);
		}
		else {
			teams = teamDao.findTeamsManagedByUser(currentUser.getUserId(), true);
		}

		List<TeamResponseDto> response = peopleMapper.teamListToTeamResponseDtoList(teams);

		log.info("getManagerTeams: Successfully finished");
		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional
	public ResponseEntityDto getTeamsForCurrentUser() {
		log.info("getTeamsForCurrentUser: execution started");

		User currentUser = userService.getCurrentUser();
		List<Team> teams = employeeTeamDao.findTeamsByEmployeeId(currentUser.getEmployee().getEmployeeId());

		List<TeamBasicDetailsResponseDto> response = peopleMapper.teamListToTeamBasicDetailsResponseDtoList(teams);

		log.info("getTeamsForCurrentUser: Successfully finished");
		return new ResponseEntityDto(false, response);
	}

	private void setUpNewTeam(List<EmployeeTeam> employeeTeamList, TransferTeamMembersDto transfer) {
		Optional<Employee> employeeOptional = employeeDao.findById(transfer.getEmployeeId());
		Optional<Team> teamOptional = teamDao.findByTeamIdAndIsActive(transfer.getTeamId(), true);

		if (employeeOptional.isPresent() && teamOptional.isPresent()) {
			checkAndSetEmployeeTeam(employeeTeamList, employeeOptional.get(), teamOptional.get());
		}
		else {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND);
		}
	}

	private void checkAndSetEmployeeTeam(List<EmployeeTeam> employeeTeamList, Employee employee, Team team) {
		if (!isEmployeeAlreadyExist(employee, team)) {
			EmployeeTeam employeeTeam = new EmployeeTeam();
			employeeTeam.setEmployee(employee);
			employeeTeam.setTeam(team);
			employeeTeam.setIsSupervisor(false);
			employeeTeamList.add(employeeTeam);
		}
		else {
			log.info("employee {} is already exist in the team: {}", employee.getEmployeeId(), team.getTeamId());
		}
	}

	private boolean teamNameCheck(String teamName) {
		Optional<Team> alreadyExistingTeam = teamDao.findByTeamNameAndIsActiveTrue(teamName);
		return alreadyExistingTeam.isPresent();
	}

	private void setEmployeeTeam(List<EmployeeTeam> employeeTeamSet, List<Employee> employees, Team team,
			boolean isSupervisor) {
		if (!employees.isEmpty()) {
			for (Employee employee : employees) {
				EmployeeTeam member = new EmployeeTeam();
				member.setTeam(team);
				member.setEmployee(employee);
				member.setIsSupervisor(isSupervisor);
				employeeTeamSet.add(member);
			}
		}
	}

	private List<TransferTeamMembersDto> getFilteredTransferTeamMembers(
			List<TransferTeamMembersDto> transferTeamMembersDtoList, Team team) {
		List<Long> teamEmployees = team.getEmployees()
			.stream()
			.map(employeeTeam -> employeeTeam.getEmployee().getEmployeeId())
			.sorted()
			.toList();

		// assign team not the given(deleting) team
		transferTeamMembersDtoList.stream()
			.filter(obj -> obj.getTeamId().equals(team.getTeamId()))
			.findFirst()
			.ifPresent(a -> {
				throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND);
			});

		// filter employees where employee is a member of given team
		transferTeamMembersDtoList = transferTeamMembersDtoList.stream()
			.filter(obj -> teamEmployees.contains(obj.getEmployeeId()))
			.toList();

		return transferTeamMembersDtoList;
	}

	private boolean isEmployeeAlreadyExist(Employee employee, Team team) {
		Optional<EmployeeTeam> alreadyExistEmp = team.getEmployees()
			.stream()
			.filter(employeeTeam -> employeeTeam.getEmployee().equals(employee))
			.findFirst();
		return alreadyExistEmp.isPresent();
	}

}
