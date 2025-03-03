package com.skapp.enterprise.peopleplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeePeriod;
import com.skapp.community.peopleplanner.model.EmployeeProgression;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.JobFamily;
import com.skapp.community.peopleplanner.model.JobTitle;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.CurrentEmployeeDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeDetailsDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeProgressionsDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeUpdateDto;
import com.skapp.community.peopleplanner.payload.request.ProbationPeriodDto;
import com.skapp.community.peopleplanner.payload.request.RoleRequestDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeePeriodDao;
import com.skapp.community.peopleplanner.repository.JobFamilyDao;
import com.skapp.community.peopleplanner.repository.JobTitleDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.enterprise.peopleplanner.constant.EpEmployeeTimelineConstant;
import com.skapp.enterprise.peopleplanner.mapper.EpPeopleMapper;
import com.skapp.enterprise.peopleplanner.model.EmployeeTimeline;
import com.skapp.enterprise.peopleplanner.payload.response.EpEmployeeTimelineResponseDto;
import com.skapp.enterprise.peopleplanner.payload.response.EpEmployeeTimelineResponseListDto;
import com.skapp.enterprise.peopleplanner.repository.EpEmployeeTimelineDao;
import com.skapp.enterprise.peopleplanner.service.EpEmployeeTimelineService;
import com.skapp.enterprise.peopleplanner.type.EpEmployeeTimelineType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class EpEmployeeTimelineServiceImpl implements EpEmployeeTimelineService {

	private final EpEmployeeTimelineDao epEmployeeTimelineDao;

	private final UserService userService;

	private final EmployeeDao employeeDao;

	private final EpPeopleMapper epPeopleMapper;

	private final JobTitleDao jobTitleDao;

	private final JobFamilyDao jobFamilyDao;

	private final TeamDao teamDao;

	private final EmployeePeriodDao employeePeriodDao;

	@Override
	public ResponseEntityDto getEmployeeTimelineRecords(Long id) {
		User currentUser = userService.getCurrentUser();
		log.info("getEmployeeTimelineRecords: started by user: {}", currentUser.getUserId());

		Employee employee = employeeDao.findById(id)
			.orElseThrow(() -> new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_RESOURCE_NOT_FOUND));

		List<EmployeeTimeline> employeeTimelines = epEmployeeTimelineDao.findAllByEmployee(employee);

		List<EpEmployeeTimelineResponseListDto> responseList = mapToResponseListDto(employeeTimelines);

		log.info("getEmployeeTimelineRecords: completed by user: {}", currentUser.getUserId());
		return new ResponseEntityDto(false, responseList);
	}

	@Override
	public void addNewEmployeeTimeLineRecords(Employee savedEmployee, EmployeeDetailsDto employeeDetailsDto) {
		List<EmployeeTimeline> employeeTimelines = new ArrayList<>();

		addJobProgressionTimeline(savedEmployee, employeeTimelines);
		addJoinDateTimeline(savedEmployee, employeeTimelines);
		addProbationDateTimeline(savedEmployee, employeeTimelines);
		addTeamTimeline(savedEmployee, employeeTimelines);
		addManagerTimeline(savedEmployee, employeeTimelines);
		addEmploymentAllocationTimeline(savedEmployee, employeeTimelines);
		addSystemPermissionTimeline(savedEmployee, employeeDetailsDto, employeeTimelines);

		epEmployeeTimelineDao.saveAll(employeeTimelines);
	}

	@Override
	public void addUpdatedEmployeeTimeLineRecords(CurrentEmployeeDto currentEmployee,
			EmployeeUpdateDto employeeUpdateDto) {
		List<EmployeeTimeline> employeeTimelines = new ArrayList<>();

		updateJobProgressionTimeline(currentEmployee, employeeUpdateDto, employeeTimelines);
		updateJoinDateTimeline(currentEmployee, employeeUpdateDto, employeeTimelines);
		updateProbationDateTimeline(currentEmployee, employeeUpdateDto, employeeTimelines);
		updateTeamTimeline(currentEmployee, employeeUpdateDto, employeeTimelines);
		updateManagerTimeline(currentEmployee, employeeUpdateDto, employeeTimelines);
		updateEmploymentAllocationTimeline(currentEmployee, employeeUpdateDto, employeeTimelines);
		updateSystemPermissionTimeline(currentEmployee, employeeUpdateDto, employeeTimelines);

		epEmployeeTimelineDao.saveAll(employeeTimelines);
	}

	private EmployeeTimeline createEmployeeTimeline(Employee employee, EpEmployeeTimelineType timelineType,
			String previousValue, String newValue) {
		EmployeeTimeline employeeTimeline = new EmployeeTimeline();
		employeeTimeline.setEmployee(employee);
		employeeTimeline.setTimelineType(timelineType);
		employeeTimeline.setPreviousValue(previousValue);
		employeeTimeline.setNewValue(newValue);
		return employeeTimeline;
	}

	private List<EpEmployeeTimelineResponseListDto> mapToResponseListDto(List<EmployeeTimeline> employeeTimelines) {
		if (employeeTimelines.isEmpty()) {
			return Collections.emptyList();
		}

		return employeeTimelines.stream()
			.filter(e -> e.getLastModifiedDate() != null)
			.collect(Collectors.groupingBy(e -> YearMonth.from(e.getLastModifiedDate())))
			.entrySet()
			.stream()
			.map(entry -> {
				YearMonth yearMonth = entry.getKey();
				List<EpEmployeeTimelineResponseDto> records = epPeopleMapper
					.employeeTimelinesToEmployeeTimelineResponseDtoList(entry.getValue());

				EpEmployeeTimelineResponseListDto responseDto = new EpEmployeeTimelineResponseListDto();
				responseDto.setYear((long) yearMonth.getYear());
				responseDto.setMonth(String.valueOf(yearMonth.getMonthValue()));
				responseDto.setEmployeeTimelineRecords(records);

				return responseDto;
			})
			.sorted(Comparator.comparing(EpEmployeeTimelineResponseListDto::getYear)
				.thenComparing(e -> Integer.parseInt(e.getMonth())))
			.toList();
	}

	private void addJobProgressionTimeline(Employee savedEmployee, List<EmployeeTimeline> employeeTimelines) {

		if (savedEmployee.getEmployeeProgressions() != null && !savedEmployee.getEmployeeProgressions().isEmpty()) {
			EmployeeProgression savedCurrentEmployeeProgression = savedEmployee.getEmployeeProgressions()
				.stream()
				.filter(EmployeeProgression::getIsCurrent)
				.findFirst()
				.orElse(null);

			if (savedCurrentEmployeeProgression != null) {
				EmployeeProgressionsDto savedCurrentEmployeeProgressionDto = epPeopleMapper
					.employeeProgressionToEmployeeProgressionDto(savedCurrentEmployeeProgression);
				handleNewJobAssignment(savedEmployee, savedCurrentEmployeeProgressionDto, employeeTimelines);
			}
		}
	}

	private void updateJobProgressionTimeline(CurrentEmployeeDto currentEmployee, EmployeeUpdateDto employeeUpdateDto,
			List<EmployeeTimeline> employeeTimelines) {

		Optional<Employee> employee = employeeDao.findById(currentEmployee.getEmployeeId());
		if (employee.isEmpty()) {
			return;
		}

		EmployeeProgression currentEmployeeProgression = currentEmployee.getEmployeeProgressions()
			.stream()
			.filter(EmployeeProgression::getIsCurrent)
			.findFirst()
			.orElse(null);

		EmployeeProgressionsDto newEmployeeProgression = employeeUpdateDto.getEmployeeProgressions()
			.stream()
			.filter(EmployeeProgressionsDto::getIsCurrent)
			.findFirst()
			.orElse(null);

		if (newEmployeeProgression == null) {
			return;
		}

		if (currentEmployeeProgression != null) {
			handleJobTitleChange(employee.get(), currentEmployeeProgression, newEmployeeProgression, employeeTimelines);
			handleJobFamilyChange(employee.get(), currentEmployeeProgression, newEmployeeProgression,
					employeeTimelines);
			handleEmployeeTypeChange(employee.get(), currentEmployeeProgression, newEmployeeProgression,
					employeeTimelines);
		}
		else {
			handleNewJobAssignment(employee.get(), newEmployeeProgression, employeeTimelines);
		}
	}

	private void handleJobTitleChange(Employee currentEmployee, EmployeeProgression currentProgression,
			EmployeeProgressionsDto newProgression, List<EmployeeTimeline> employeeTimelines) {
		if (currentProgression.getJobTitleId() != null && newProgression.getJobTitleId() != null
				&& !currentProgression.getJobTitleId().equals(newProgression.getJobTitleId())) {

			Optional<JobTitle> currentJobTitle = jobTitleDao.findById(currentProgression.getJobTitleId());
			Optional<JobTitle> newJobTitle = jobTitleDao.findById(newProgression.getJobTitleId());

			if (currentJobTitle.isPresent() && newJobTitle.isPresent()) {
				employeeTimelines.add(createEmployeeTimeline(currentEmployee, EpEmployeeTimelineType.JOB_TITLE_CHANGED,
						currentJobTitle.get().getName(), newJobTitle.get().getName()));
			}
		}
	}

	private void handleJobFamilyChange(Employee currentEmployee, EmployeeProgression currentProgression,
			EmployeeProgressionsDto newProgression, List<EmployeeTimeline> employeeTimelines) {
		if (currentProgression.getJobFamilyId() != null && newProgression.getJobFamilyId() != null
				&& !currentProgression.getJobFamilyId().equals(newProgression.getJobFamilyId())) {

			Optional<JobFamily> currentJobFamily = jobFamilyDao.findById(currentProgression.getJobFamilyId());
			Optional<JobFamily> newJobFamily = jobFamilyDao.findById(newProgression.getJobFamilyId());

			if (currentJobFamily.isPresent() && newJobFamily.isPresent()) {
				employeeTimelines.add(createEmployeeTimeline(currentEmployee, EpEmployeeTimelineType.JOB_FAMILY_CHANGED,
						currentJobFamily.get().getName(), newJobFamily.get().getName()));
			}
		}
	}

	private void handleEmployeeTypeChange(Employee currentEmployee, EmployeeProgression currentProgression,
			EmployeeProgressionsDto newProgression, List<EmployeeTimeline> employeeTimelines) {
		if (currentProgression.getEmployeeType() != null && newProgression.getEmployeeType() != null
				&& !currentProgression.getEmployeeType().equals(newProgression.getEmployeeType())) {
			employeeTimelines
				.add(createEmployeeTimeline(currentEmployee, EpEmployeeTimelineType.EMPLOYMENT_TYPE_CHANGED,
						currentProgression.getEmployeeType().toString(), newProgression.getEmployeeType().toString()));
		}
	}

	private void handleNewJobAssignment(Employee currentEmployee, EmployeeProgressionsDto newProgression,
			List<EmployeeTimeline> employeeTimelines) {
		if (newProgression.getJobTitleId() != null) {
			jobTitleDao.findById(newProgression.getJobTitleId())
				.ifPresent(title -> employeeTimelines.add(createEmployeeTimeline(currentEmployee,
						EpEmployeeTimelineType.JOB_TITLE_ASSIGNED, null, title.getName())));
		}

		if (newProgression.getJobFamilyId() != null) {
			jobFamilyDao.findById(newProgression.getJobFamilyId())
				.ifPresent(family -> employeeTimelines.add(createEmployeeTimeline(currentEmployee,
						EpEmployeeTimelineType.JOB_FAMILY_ASSIGNED, null, family.getName())));
		}

		if (newProgression.getEmployeeType() != null) {
			employeeTimelines.add(createEmployeeTimeline(currentEmployee, EpEmployeeTimelineType.EMPLOYMENT_TYPE_ADDED,
					null, newProgression.getEmployeeType().toString()));
		}
	}

	private void addJoinDateTimeline(Employee employee, List<EmployeeTimeline> employeeTimelines) {
		if (employee.getJoinDate() != null) {
			employeeTimelines.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.JOINED_DATE_ADDED, null,
					employee.getJoinDate().toString()));
		}
	}

	private void updateJoinDateTimeline(CurrentEmployeeDto currentEmployee, EmployeeUpdateDto employeeUpdateDto,
			List<EmployeeTimeline> employeeTimelines) {
		if (employeeUpdateDto.getJoinDate() != null) {
			Optional<Employee> employee = employeeDao.findById(currentEmployee.getEmployeeId());
			if (employee.isEmpty()) {
				return;
			}
			if (currentEmployee.getJoinDate() != null) {
				if (employeeUpdateDto.getJoinDate().equals(currentEmployee.getJoinDate())) {
					return;
				}
				employeeTimelines.add(createEmployeeTimeline(employee.get(), EpEmployeeTimelineType.JOINED_DATE_CHANGED,
						currentEmployee.getJoinDate().toString(), employeeUpdateDto.getJoinDate().toString()));
			}
			else {
				employeeTimelines.add(createEmployeeTimeline(employee.get(), EpEmployeeTimelineType.JOINED_DATE_ADDED,
						null, employeeUpdateDto.getJoinDate().toString()));
			}
		}
	}

	private void addTeamTimeline(Employee savedEmployee, List<EmployeeTimeline> employeeTimelines) {
		if (savedEmployee.getTeams() == null || savedEmployee.getTeams().isEmpty()) {
			return;
		}
		savedEmployee.getTeams()
			.forEach(empTeam -> employeeTimelines.add(createEmployeeTimeline(savedEmployee,
					EpEmployeeTimelineType.TEAM_ASSIGNED, null, empTeam.getTeam().getTeamName())));
	}

	private void updateTeamTimeline(CurrentEmployeeDto currentEmployee, EmployeeUpdateDto employeeUpdateDto,
			List<EmployeeTimeline> employeeTimelines) {

		Optional<Employee> employeeOpt = employeeDao.findById(currentEmployee.getEmployeeId());
		if (employeeOpt.isEmpty()) {
			return;
		}
		Employee employee = employeeOpt.get();

		List<Team> newTeams = teamDao.findAllById(employeeUpdateDto.getTeams());
		Set<Team> currentTeams = currentEmployee.getTeams() == null ? Set.of()
				: currentEmployee.getTeams().stream().map(EmployeeTeam::getTeam).collect(Collectors.toSet());

		List<Team> teamsToAdd = newTeams.stream().filter(team -> !currentTeams.contains(team)).toList();
		List<Team> teamsToRemove = currentTeams.stream().filter(team -> !newTeams.contains(team)).toList();

		teamsToRemove.forEach(team -> employeeTimelines
			.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.TEAM_REMOVED, team.getTeamName(), null)));

		teamsToAdd.forEach(team -> employeeTimelines
			.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.TEAM_ASSIGNED, null, team.getTeamName())));
	}

	private void addManagerTimeline(Employee savedEmployee, List<EmployeeTimeline> employeeTimelines) {
		if (savedEmployee.getManagers() != null && !savedEmployee.getManagers().isEmpty()) {
			savedEmployee.getManagers().forEach(empManager -> {
				EpEmployeeTimelineType epEmployeeTimelineType = getManagerTypeTitle(empManager, false);
				if (epEmployeeTimelineType != null) {
					employeeTimelines.add(createEmployeeTimeline(savedEmployee, epEmployeeTimelineType, null,
							empManager.getManager().getFirstName() + " " + empManager.getManager().getLastName()));
				}
			});
		}
	}

	private void updateManagerTimeline(CurrentEmployeeDto currentEmployee, EmployeeUpdateDto employeeUpdateDto,
			List<EmployeeTimeline> employeeTimelines) {
		Optional<Employee> employee = employeeDao.findById(currentEmployee.getEmployeeId());
		if (employee.isEmpty()) {
			return;
		}
		if (currentEmployee.getManagers() != null && !currentEmployee.getManagers().isEmpty()) {
			currentEmployee.getManagers().forEach(empManager -> {
				EpEmployeeTimelineType epEmployeeTimelineType = getManagerTypeTitle(empManager, true);

				if (epEmployeeTimelineType != null && ((employeeUpdateDto.getPrimaryManager() != null
						&& empManager.getManagerType().equals(ManagerType.PRIMARY))
						|| (employeeUpdateDto.getSecondaryManager() != null
								&& empManager.getManagerType().equals(ManagerType.SECONDARY)))) {
					employeeTimelines.add(createEmployeeTimeline(employee.get(), epEmployeeTimelineType, null,
							empManager.getManager().getFirstName() + " " + empManager.getManager().getLastName()));
				}

			});
		}
	}

	private EpEmployeeTimelineType getManagerTypeTitle(EmployeeManager empManager, boolean updated) {
		if (updated) {
			if (empManager.getManagerType() == ManagerType.PRIMARY) {
				return EpEmployeeTimelineType.PRIMARY_SUPERVISOR_CHANGED;
			}
			else if (empManager.getManagerType() == ManagerType.SECONDARY) {
				return EpEmployeeTimelineType.SECONDARY_SUPERVISOR_CHANGED;
			}
		}
		else {
			if (empManager.getManagerType() == ManagerType.PRIMARY) {
				return EpEmployeeTimelineType.PRIMARY_SUPERVISOR_ASSIGNED;
			}
			else if (empManager.getManagerType() == ManagerType.SECONDARY) {
				return EpEmployeeTimelineType.SECONDARY_SUPERVISOR_ASSIGNED;
			}
		}
		return null;
	}

	private void addProbationDateTimeline(Employee savedEmployee, List<EmployeeTimeline> employeeTimelines) {
		employeePeriodDao.findEmployeePeriodByEmployee_EmployeeId(savedEmployee.getEmployeeId())
			.ifPresent(employeePeriod -> {
				addProbationDateTimelineEntry(savedEmployee, employeeTimelines,
						EpEmployeeTimelineType.PROBATION_START_DATE_ADDED, employeePeriod.getStartDate());

				addProbationDateTimelineEntry(savedEmployee, employeeTimelines,
						EpEmployeeTimelineType.PROBATION_END_DATE_ADDED, employeePeriod.getEndDate());
			});
	}

	private void updateProbationDateTimeline(CurrentEmployeeDto currentEmployee, EmployeeUpdateDto employeeUpdateDto,
			List<EmployeeTimeline> employeeTimelines) {
		Optional<Employee> employeeOpt = employeeDao.findById(currentEmployee.getEmployeeId());
		if (employeeOpt.isEmpty()) {
			return;
		}
		Employee employee = employeeOpt.get();

		EmployeePeriod currentEmployeePeriod = currentEmployee.getEmployeePeriod();
		ProbationPeriodDto newEmployeePeriod = employeeUpdateDto.getEmployeePeriod();

		if (newEmployeePeriod == null) {
			return;
		}

		if (currentEmployeePeriod != null) {
			addProbationDateChangeTimelineEntry(employee, employeeTimelines,
					EpEmployeeTimelineType.PROBATION_START_DATE_CHANGED, currentEmployeePeriod.getStartDate(),
					newEmployeePeriod.getStartDate());

			addProbationDateChangeTimelineEntry(employee, employeeTimelines,
					EpEmployeeTimelineType.PROBATION_END_DATE_CHANGED, currentEmployeePeriod.getEndDate(),
					newEmployeePeriod.getEndDate());
		}
		else {
			addProbationDateTimelineEntry(employee, employeeTimelines,
					EpEmployeeTimelineType.PROBATION_START_DATE_ADDED, newEmployeePeriod.getStartDate());

			addProbationDateTimelineEntry(employee, employeeTimelines, EpEmployeeTimelineType.PROBATION_END_DATE_ADDED,
					newEmployeePeriod.getEndDate());
		}
	}

	private void addProbationDateTimelineEntry(Employee employee, List<EmployeeTimeline> employeeTimelines,
			EpEmployeeTimelineType type, LocalDate date) {
		if (date != null) {
			employeeTimelines.add(createEmployeeTimeline(employee, type, null, date.toString()));
		}
	}

	private void addProbationDateChangeTimelineEntry(Employee employee, List<EmployeeTimeline> employeeTimelines,
			EpEmployeeTimelineType type, LocalDate oldDate, LocalDate newDate) {
		if (oldDate != null && newDate != null && !oldDate.equals(newDate)) {
			employeeTimelines.add(createEmployeeTimeline(employee, type, oldDate.toString(), newDate.toString()));
		}
	}

	public void addEmploymentAllocationTimeline(Employee savedEmployee, List<EmployeeTimeline> employeeTimelines) {
		if (savedEmployee.getEmploymentAllocation() != null) {
			employeeTimelines
				.add(createEmployeeTimeline(savedEmployee, EpEmployeeTimelineType.EMPLOYMENT_ALLOCATION_ADDED, null,
						savedEmployee.getEmploymentAllocation().toString()));
		}
	}

	private void updateEmploymentAllocationTimeline(CurrentEmployeeDto currentEmployee,
			EmployeeUpdateDto employeeUpdateDto, List<EmployeeTimeline> employeeTimelines) {
		Optional<Employee> employeeOpt = employeeDao.findById(currentEmployee.getEmployeeId());
		if (employeeOpt.isEmpty()) {
			return;
		}
		Employee employee = employeeOpt.get();

		EmploymentAllocation currentEmploymentAllocation = currentEmployee.getEmploymentAllocation();
		EmploymentAllocation newEmploymentAllocation = employeeUpdateDto.getEmploymentAllocation();

		if (newEmploymentAllocation != null) {
			if (currentEmploymentAllocation != null) {
				if (newEmploymentAllocation.equals(currentEmploymentAllocation)) {
					return;
				}
				employeeTimelines
					.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.EMPLOYMENT_ALLOCATION_CHANGED,
							currentEmploymentAllocation.toString(), newEmploymentAllocation.toString()));
			}
			else {
				employeeTimelines.add(createEmployeeTimeline(employee,
						EpEmployeeTimelineType.EMPLOYMENT_ALLOCATION_ADDED, null, newEmploymentAllocation.toString()));
			}
		}
	}

	private void addSystemPermissionTimeline(Employee savedEmployee, EmployeeDetailsDto employeeDetailsDto,
			List<EmployeeTimeline> employeeTimelines) {
		RoleRequestDto employeeRole = employeeDetailsDto.getUserRoles();

		if (employeeRole == null) {
			return;
		}

		Map<Role, String> roleMappings = Map.of(employeeRole.getPeopleRole(),
				EpEmployeeTimelineConstant.PEOPLE_ROLE_PREFIX, employeeRole.getAttendanceRole(),
				EpEmployeeTimelineConstant.ATTENDANCE_ROLE_PREFIX, employeeRole.getLeaveRole(),
				EpEmployeeTimelineConstant.LEAVE_ROLE_PREFIX, employeeRole.getEsignRole(),
				EpEmployeeTimelineConstant.ESIGN_ROLE_PREFIX);

		roleMappings.forEach((role, prefix) -> {
			if (role != null) {
				String roleName = getRoleNameWithModule(role, prefix);
				if (roleName != null) {
					employeeTimelines.add(createEmployeeTimeline(savedEmployee,
							EpEmployeeTimelineType.SYSTEM_PERMISSION_GRANTED, null, roleName));
				}
			}
		});
	}

	private void updateSystemPermissionTimeline(CurrentEmployeeDto currentEmployee, EmployeeUpdateDto employeeUpdateDto,
			List<EmployeeTimeline> employeeTimelines) {
		Optional<Employee> employeeOpt = employeeDao.findById(currentEmployee.getEmployeeId());
		if (employeeOpt.isEmpty()) {
			return;
		}
		Employee employee = employeeOpt.get();

		EmployeeRole currentEmployeeRole = currentEmployee.getEmployeeRole();
		RoleRequestDto newEmployeeRole = employeeUpdateDto.getUserRoles();

		if (newEmployeeRole != null) {
			if (!currentEmployeeRole.getPeopleRole().equals(newEmployeeRole.getPeopleRole())) {
				String previousRoleName = getRoleNameWithModule(currentEmployeeRole.getPeopleRole(),
						EpEmployeeTimelineConstant.PEOPLE_ROLE_PREFIX);
				String newRoleName = getRoleNameWithModule(newEmployeeRole.getPeopleRole(),
						EpEmployeeTimelineConstant.PEOPLE_ROLE_PREFIX);
				employeeTimelines.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.SYSTEM_PERMISSION_CHANGED,
						previousRoleName, newRoleName));
			}
			if (!currentEmployeeRole.getLeaveRole().equals(newEmployeeRole.getLeaveRole())) {
				String previousRoleName = getRoleNameWithModule(currentEmployeeRole.getPeopleRole(),
						EpEmployeeTimelineConstant.LEAVE_ROLE_PREFIX);
				String newRoleName = getRoleNameWithModule(newEmployeeRole.getPeopleRole(),
						EpEmployeeTimelineConstant.LEAVE_ROLE_PREFIX);
				employeeTimelines.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.SYSTEM_PERMISSION_CHANGED,
						previousRoleName, newRoleName));
			}
			if (!currentEmployeeRole.getAttendanceRole().equals(newEmployeeRole.getAttendanceRole())) {
				String previousRoleName = getRoleNameWithModule(currentEmployeeRole.getPeopleRole(),
						EpEmployeeTimelineConstant.ATTENDANCE_ROLE_PREFIX);
				String newRoleName = getRoleNameWithModule(newEmployeeRole.getPeopleRole(),
						EpEmployeeTimelineConstant.ATTENDANCE_ROLE_PREFIX);
				employeeTimelines.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.SYSTEM_PERMISSION_CHANGED,
						previousRoleName, newRoleName));
			}
			if (!currentEmployeeRole.getEsignRole().equals(newEmployeeRole.getEsignRole())) {
				String previousRoleName = getRoleNameWithModule(currentEmployeeRole.getPeopleRole(),
						EpEmployeeTimelineConstant.ESIGN_ROLE_PREFIX);
				String newRoleName = getRoleNameWithModule(newEmployeeRole.getPeopleRole(),
						EpEmployeeTimelineConstant.ESIGN_ROLE_PREFIX);
				employeeTimelines.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.SYSTEM_PERMISSION_CHANGED,
						previousRoleName, newRoleName));
			}
		}
	}

	private String getRoleNameWithModule(Role role, String rolePrefix) {
		String roleStr = role.toString();

		if (roleStr.contains(EpEmployeeTimelineConstant.EMPLOYEE)) {
			return rolePrefix + EpEmployeeTimelineConstant.EMPLOYEE_ROLE;
		}
		else if (roleStr.contains(EpEmployeeTimelineConstant.ADMIN)) {
			return rolePrefix + EpEmployeeTimelineConstant.ADMIN_ROLE;
		}
		else if (roleStr.contains(EpEmployeeTimelineConstant.MANAGER)) {
			return rolePrefix + EpEmployeeTimelineConstant.MANAGER_ROLE;
		}
		else if (roleStr.contains(EpEmployeeTimelineConstant.SIGNER)) {
			return rolePrefix + EpEmployeeTimelineConstant.SIGNER_ROLE;
		}
		return null;
	}

}
