package com.skapp.enterprise.people.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.type.RoleLevel;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.leaveplanner.model.LeaveEntitlement;
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
import com.skapp.community.peopleplanner.payload.request.EmployeeQuickAddDto;
import com.skapp.community.peopleplanner.payload.request.ProbationPeriodDto;
import com.skapp.community.peopleplanner.payload.request.employee.CreateEmployeeRequestDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeSystemPermissionsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentCareerProgressionDetailsDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeePeriodDao;
import com.skapp.community.peopleplanner.repository.JobFamilyDao;
import com.skapp.community.peopleplanner.repository.JobTitleDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.service.RolesService;
import com.skapp.community.peopleplanner.type.EmployeePeriodSort;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.people.mapper.EpPeopleMapper;
import com.skapp.enterprise.people.model.EmployeeTimeline;
import com.skapp.enterprise.people.payload.response.EpEmployeeTimelineResponseDto;
import com.skapp.enterprise.people.payload.response.EpEmployeeTimelineResponseListDto;
import com.skapp.enterprise.people.repository.EpEmployeeTimelineDao;
import com.skapp.enterprise.people.service.EpEmployeeTimelineService;
import com.skapp.enterprise.people.service.EpUserService;
import com.skapp.enterprise.people.type.EpEmployeeTimelineType;
import com.skapp.enterprise.people.type.EpTimelineModuleType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
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

	private final EpUserService epUserService;

	private final RolesService rolesService;

	@Override
	public ResponseEntityDto getEmployeeTimelineRecords(Long id) {
		User currentUser = userService.getCurrentUser();
		log.info("getEmployeeTimelineRecords: started by user: {}", currentUser.getUserId());

		List<Tier> currentUserTiers = epUserService.getCurrentUserTiers();
		if (!currentUserTiers.contains(Tier.CORE)) {
			log.info("getEmployeeTimelineRecords: invalid tier. Completed by user: {}", currentUser.getUserId());
			return new ResponseEntityDto(false, new ArrayList<>());
		}

		if (!employeeDao.existsById(id)) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND);
		}

		List<EmployeeTimeline> employeeTimelines = epEmployeeTimelineDao.findAllByEmployeeIdWithRecordedBy(id);

		List<EpEmployeeTimelineResponseListDto> responseList = mapToResponseListDto(employeeTimelines);

		log.info("getEmployeeTimelineRecords: completed by user: {}", currentUser.getUserId());
		return new ResponseEntityDto(false, responseList);
	}

	@Override
	public void addNewEmployeeTimeLineRecords(Employee savedEmployee, CreateEmployeeRequestDto employeeDetailsDto) {
		List<EmployeeTimeline> employeeTimelines = new ArrayList<>();

		addJobProgressionTimeline(savedEmployee, employeeTimelines);
		addJoinDateTimeline(savedEmployee, employeeTimelines);
		addProbationDateTimeline(savedEmployee, employeeTimelines);
		addTeamTimeline(savedEmployee, employeeTimelines);
		addManagerTimeline(savedEmployee, employeeTimelines);
		addEmploymentAllocationTimeline(savedEmployee, employeeTimelines);
		addSystemPermissionTimeline(savedEmployee, employeeDetailsDto.getSystemPermissions(), employeeTimelines);

		epEmployeeTimelineDao.saveAll(employeeTimelines);
	}

	@Override
	public void addNewQuickUploadedEmployeeTimeLineRecords(Employee savedEmployee,
			EmployeeQuickAddDto employeeQuickAddDto) {
		List<EmployeeTimeline> employeeTimelines = new ArrayList<>();

		addSystemPermissionTimeline(savedEmployee, rolesService.getDefaultEmployeeRoles(), employeeTimelines);

		epEmployeeTimelineDao.saveAll(employeeTimelines);
	}

	@Override
	public void addUpdatedEmployeeTimeLineRecords(CurrentEmployeeDto currentEmployee,
			CreateEmployeeRequestDto createEmployeeRequestDto) {
		List<EmployeeTimeline> employeeTimelines = new ArrayList<>();

		updateJobProgressionTimeline(currentEmployee, createEmployeeRequestDto, employeeTimelines);
		updateJoinDateTimeline(currentEmployee, createEmployeeRequestDto, employeeTimelines);
		updateProbationDateTimeline(currentEmployee, createEmployeeRequestDto, employeeTimelines);
		updateTeamTimeline(currentEmployee, createEmployeeRequestDto, employeeTimelines);
		updateManagerTimeline(currentEmployee, createEmployeeRequestDto, employeeTimelines);
		updateEmploymentAllocationTimeline(currentEmployee, createEmployeeRequestDto, employeeTimelines);
		updateSystemPermissionTimeline(currentEmployee, createEmployeeRequestDto, employeeTimelines);

		epEmployeeTimelineDao.saveAll(employeeTimelines);
	}

	@Override
	public void addCustomLeaveEntitlementsTimeLineRecords(Employee employee, LeaveEntitlement leaveEntitlement) {
		EmployeeTimeline employeeTimeline = createEmployeeTimeline(employee,
				EpEmployeeTimelineType.CUSTOM_ALLOCATION_ADDED, null,
				leaveEntitlement.getLeaveType().getName() + " " + leaveEntitlement.getTotalDaysAllocated());

		epEmployeeTimelineDao.save(employeeTimeline);
	}

	@Override
	public void addBulkLeaveEntitlementsTimeLineRecords(Employee employee, List<LeaveEntitlement> leaveEntitlements,
			boolean isCustom, User currentUser) {
		List<EmployeeTimeline> employeeTimelines = new ArrayList<>();
		EpEmployeeTimelineType epEmployeeTimelineType;

		if (isCustom) {
			epEmployeeTimelineType = EpEmployeeTimelineType.CUSTOM_ALLOCATION_ADDED;
		}
		else {
			epEmployeeTimelineType = EpEmployeeTimelineType.ENTITLEMENT_ADDED;
		}

		leaveEntitlements.forEach(leaveEntitlement -> {
			EmployeeTimeline employeeTimeline = createEmployeeTimeline(employee, epEmployeeTimelineType, null,
					leaveEntitlement.getLeaveType().getName() + " " + leaveEntitlement.getTotalDaysAllocated());
			employeeTimeline.setRecordedBy(currentUser.getEmployee());
			employeeTimelines.add(employeeTimeline);
		});

		epEmployeeTimelineDao.saveAll(employeeTimelines);
	}

	@Override
	public void addUpdatedLeaveEntitlementsTimeLineRecords(Employee employee, String oldHistoryRecord,
			String newHistoryRecord, boolean isCustom) {
		EpEmployeeTimelineType epEmployeeTimelineType;

		if (isCustom) {
			epEmployeeTimelineType = EpEmployeeTimelineType.CUSTOM_ALLOCATION_UPDATED;
		}
		else {
			epEmployeeTimelineType = EpEmployeeTimelineType.ENTITLEMENT_UPDATED;
		}

		EmployeeTimeline employeeTimeline = createEmployeeTimeline(employee, epEmployeeTimelineType, oldHistoryRecord,
				newHistoryRecord);

		epEmployeeTimelineDao.save(employeeTimeline);
	}

	@Override
	public void addDeletedLeaveEntitlementsTimeLineRecords(Employee employee, String oldHistoryRecord) {
		EmployeeTimeline employeeTimeline = createEmployeeTimeline(employee,
				EpEmployeeTimelineType.CUSTOM_ALLOCATION_REMOVED, oldHistoryRecord, null);
		epEmployeeTimelineDao.save(employeeTimeline);
	}

	@Override
	public void addNewEmployeeTimeLineRecordForBulk(Employee savedEmployee) {
		List<EmployeeTimeline> employeeTimelines = new ArrayList<>();

		addJobProgressionTimeline(savedEmployee, employeeTimelines);
		addJoinDateTimeline(savedEmployee, employeeTimelines);
		addProbationDateTimeline(savedEmployee, employeeTimelines);
		addTeamTimeline(savedEmployee, employeeTimelines);
		addManagerTimeline(savedEmployee, employeeTimelines);
		addEmploymentAllocationTimeline(savedEmployee, employeeTimelines);

		EmployeeSystemPermissionsDto roleRequestDto = new EmployeeSystemPermissionsDto();
		roleRequestDto.setAttendanceRole(Role.ATTENDANCE_EMPLOYEE);
		roleRequestDto.setLeaveRole(Role.LEAVE_EMPLOYEE);
		roleRequestDto.setPeopleRole(Role.PEOPLE_EMPLOYEE);
		roleRequestDto.setEsignRole(Role.ESIGN_EMPLOYEE);

		addSystemPermissionTimeline(savedEmployee, roleRequestDto, employeeTimelines);

		epEmployeeTimelineDao.saveAll(employeeTimelines);
	}

	private EmployeeTimeline createEmployeeTimeline(Employee employee, EpEmployeeTimelineType timelineType,
			String previousValue, String newValue) {
		EmployeeTimeline employeeTimeline = new EmployeeTimeline();

		Employee currentEmployee = null;

		try {
			User currentUser = userService.getCurrentUser();
			currentEmployee = currentUser.getEmployee();
		}
		catch (Exception ignored) {
			// currentUser remains null if an exception is thrown
		}

		employeeTimeline.setEmployee(employee);
		employeeTimeline.setTimelineType(timelineType);
		employeeTimeline.setPreviousValue(previousValue);
		employeeTimeline.setNewValue(newValue);
		employeeTimeline.setRecordedBy(currentEmployee);
		return employeeTimeline;
	}

	private List<EpEmployeeTimelineResponseListDto> mapToResponseListDto(List<EmployeeTimeline> employeeTimelines) {
		if (employeeTimelines.isEmpty()) {
			return new ArrayList<>();
		}

		return employeeTimelines.stream()
			.filter(e -> e.getLastModifiedDate() != null)
			.collect(Collectors.groupingBy(e -> YearMonth.from(e.getLastModifiedDate()), Collectors.toList()))
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
				.thenComparing(e -> Integer.parseInt(e.getMonth()))
				.reversed())
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
				EmployeeEmploymentCareerProgressionDetailsDto savedCurrentEmployeeProgressionDto = epPeopleMapper
					.employeeProgressionToEmployeeProgressionDto(savedCurrentEmployeeProgression);
				handleNewJobAssignment(savedEmployee, savedCurrentEmployeeProgressionDto, employeeTimelines);
			}
		}
	}

	private void updateJobProgressionTimeline(CurrentEmployeeDto currentEmployee,
			CreateEmployeeRequestDto createEmployeeRequestDto, List<EmployeeTimeline> employeeTimelines) {

		Optional<Employee> employee = employeeDao.findById(currentEmployee.getEmployeeId());
		if (employee.isEmpty()) {
			return;
		}

		EmployeeProgression currentEmployeeProgression = currentEmployee.getEmployeeProgressions() != null
				? currentEmployee.getEmployeeProgressions()
					.stream()
					.filter(EmployeeProgression::getIsCurrent)
					.findFirst()
					.orElse(null)
				: null;

		EmployeeEmploymentCareerProgressionDetailsDto newEmployeeProgression = null;

		if (createEmployeeRequestDto.getEmployment() != null) {
			newEmployeeProgression = createEmployeeRequestDto.getEmployment().getCareerProgression() != null
					? createEmployeeRequestDto.getEmployment()
						.getCareerProgression()
						.stream()
						.filter(EmployeeEmploymentCareerProgressionDetailsDto::getIsCurrentEmployment)
						.findFirst()
						.orElse(null)
					: null;
		}

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
			EmployeeEmploymentCareerProgressionDetailsDto newProgression, List<EmployeeTimeline> employeeTimelines) {
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
			EmployeeEmploymentCareerProgressionDetailsDto newProgression, List<EmployeeTimeline> employeeTimelines) {
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
			EmployeeEmploymentCareerProgressionDetailsDto newProgression, List<EmployeeTimeline> employeeTimelines) {
		if (currentProgression != null && currentProgression.getEmploymentType() != null
				&& newProgression.getEmploymentType() != null
				&& !currentProgression.getEmploymentType().equals(newProgression.getEmploymentType())) {
			employeeTimelines.add(createEmployeeTimeline(currentEmployee,
					EpEmployeeTimelineType.EMPLOYMENT_TYPE_CHANGED, currentProgression.getEmploymentType().toString(),
					newProgression.getEmploymentType().toString()));
		}
	}

	private void handleNewJobAssignment(Employee currentEmployee,
			EmployeeEmploymentCareerProgressionDetailsDto newProgression, List<EmployeeTimeline> employeeTimelines) {
		if (newProgression != null && newProgression.getJobTitleId() != null) {
			jobTitleDao.findById(newProgression.getJobTitleId())
				.ifPresent(title -> employeeTimelines.add(createEmployeeTimeline(currentEmployee,
						EpEmployeeTimelineType.JOB_TITLE_ASSIGNED, null, title.getName())));
		}

		if (newProgression != null && newProgression.getJobFamilyId() != null) {
			jobFamilyDao.findById(newProgression.getJobFamilyId())
				.ifPresent(family -> employeeTimelines.add(createEmployeeTimeline(currentEmployee,
						EpEmployeeTimelineType.JOB_FAMILY_ASSIGNED, null, family.getName())));
		}

		if (newProgression != null && newProgression.getEmploymentType() != null) {
			employeeTimelines.add(createEmployeeTimeline(currentEmployee, EpEmployeeTimelineType.EMPLOYMENT_TYPE_ADDED,
					null, newProgression.getEmploymentType().toString()));
		}
	}

	private void addJoinDateTimeline(Employee employee, List<EmployeeTimeline> employeeTimelines) {
		if (employee.getJoinDate() != null) {
			employeeTimelines.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.JOINED_DATE_ADDED, null,
					employee.getJoinDate().toString()));
		}
	}

	private void updateJoinDateTimeline(CurrentEmployeeDto currentEmployee,
			CreateEmployeeRequestDto createEmployeeRequestDto, List<EmployeeTimeline> employeeTimelines) {
		if (createEmployeeRequestDto.getEmployment() == null) {
			return;
		}

		if (createEmployeeRequestDto.getEmployment().getEmploymentDetails() != null
				&& createEmployeeRequestDto.getEmployment().getEmploymentDetails().getJoinedDate() != null) {
			Optional<Employee> employee = employeeDao.findById(currentEmployee.getEmployeeId());
			if (employee.isEmpty()) {
				return;
			}
			if (currentEmployee.getJoinDate() != null) {
				if (createEmployeeRequestDto.getEmployment()
					.getEmploymentDetails()
					.getJoinedDate()
					.equals(currentEmployee.getJoinDate())) {
					return;
				}
				employeeTimelines.add(createEmployeeTimeline(employee.get(), EpEmployeeTimelineType.JOINED_DATE_CHANGED,
						currentEmployee.getJoinDate().toString(),
						createEmployeeRequestDto.getEmployment().getEmploymentDetails().getJoinedDate().toString()));
			}
			else {
				employeeTimelines.add(createEmployeeTimeline(employee.get(), EpEmployeeTimelineType.JOINED_DATE_ADDED,
						null,
						createEmployeeRequestDto.getEmployment().getEmploymentDetails().getJoinedDate().toString()));
			}
		}
	}

	private void addTeamTimeline(Employee savedEmployee, List<EmployeeTimeline> employeeTimelines) {
		if (savedEmployee.getEmployeeTeams() == null || savedEmployee.getEmployeeTeams().isEmpty()) {
			return;
		}
		savedEmployee.getEmployeeTeams()
			.forEach(empTeam -> employeeTimelines.add(createEmployeeTimeline(savedEmployee,
					EpEmployeeTimelineType.TEAM_ASSIGNED, null, empTeam.getTeam().getTeamName())));
	}

	private void updateTeamTimeline(CurrentEmployeeDto currentEmployee,
			CreateEmployeeRequestDto createEmployeeRequestDto, List<EmployeeTimeline> employeeTimelines) {

		if (createEmployeeRequestDto.getEmployment() == null) {
			return;
		}

		Optional<Employee> employeeOpt = employeeDao.findById(currentEmployee.getEmployeeId());
		if (employeeOpt.isEmpty()) {
			return;
		}

		if (createEmployeeRequestDto.getEmployment() == null
				|| createEmployeeRequestDto.getEmployment().getEmploymentDetails() == null
				|| createEmployeeRequestDto.getEmployment().getEmploymentDetails().getTeamIds() == null
				|| createEmployeeRequestDto.getEmployment().getEmploymentDetails().getTeamIds().length == 0) {
			return;
		}

		Employee employee = employeeOpt.get();

		Long[] teamIds = createEmployeeRequestDto.getEmployment().getEmploymentDetails().getTeamIds();
		List<Team> newTeams = teamDao.findAllById(Arrays.asList(teamIds));
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
		if (savedEmployee != null && savedEmployee.getEmployeeManagers() != null
				&& !savedEmployee.getEmployeeManagers().isEmpty()) {
			savedEmployee.getEmployeeManagers().forEach(empManager -> {
				EpEmployeeTimelineType epEmployeeTimelineType = getManagerTypeTitle(empManager, false);
				if (epEmployeeTimelineType != null) {
					employeeTimelines.add(createEmployeeTimeline(savedEmployee, epEmployeeTimelineType, null,
							empManager.getManager().getFirstName() + " " + empManager.getManager().getLastName()));
				}
			});
		}
	}

	private void updateManagerTimeline(CurrentEmployeeDto currentEmployee,
			CreateEmployeeRequestDto createEmployeeRequestDto, List<EmployeeTimeline> employeeTimelines) {

		if (createEmployeeRequestDto.getEmployment() == null
				|| createEmployeeRequestDto.getEmployment().getEmploymentDetails() == null) {
			return;
		}

		Optional<Employee> employee = employeeDao.findById(currentEmployee.getEmployeeId());
		if (employee.isEmpty()) {
			return;
		}
		if (currentEmployee.getManagers() != null && !currentEmployee.getManagers().isEmpty()) {
			currentEmployee.getManagers().forEach(empManager -> {
				EpEmployeeTimelineType epEmployeeTimelineType = getManagerTypeTitle(empManager, true);

				if (epEmployeeTimelineType != null && createEmployeeRequestDto.getEmployment() != null
						&& ((createEmployeeRequestDto.getEmployment()
							.getEmploymentDetails()
							.getPrimarySupervisor() != null && empManager.getManagerType().equals(ManagerType.PRIMARY))
								|| (createEmployeeRequestDto.getEmployment()
									.getEmploymentDetails()
									.getOtherSupervisors() != null
										&& empManager.getManagerType().equals(ManagerType.SECONDARY)))) {
					employeeTimelines.add(createEmployeeTimeline(employee.get(), epEmployeeTimelineType, null,
							empManager.getManager().getFirstName() + " " + empManager.getManager().getLastName()));
				}

			});
		}
	}

	private EpEmployeeTimelineType getManagerTypeTitle(EmployeeManager empManager, boolean updated) {
		if (empManager == null || empManager.getManagerType() == null) {
			return null;
		}

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
		if (savedEmployee == null || employeeTimelines == null) {
			return;
		}

		List<EmployeePeriod> employeePeriods = employeePeriodDao.findEmployeePeriodByEmployee_EmployeeId(
				savedEmployee.getEmployeeId(), Sort.by(Sort.Direction.DESC, EmployeePeriodSort.ID.getSortField()));
		if (!employeePeriods.isEmpty()) {
			EmployeePeriod employeePeriod = employeePeriods.getFirst();
			addProbationDateTimelineEntry(savedEmployee, employeeTimelines,
					EpEmployeeTimelineType.PROBATION_START_DATE_ADDED, employeePeriod.getStartDate());

			addProbationDateTimelineEntry(savedEmployee, employeeTimelines,
					EpEmployeeTimelineType.PROBATION_END_DATE_ADDED, employeePeriod.getEndDate());
		}
	}

	private void updateProbationDateTimeline(CurrentEmployeeDto currentEmployee,
			CreateEmployeeRequestDto createEmployeeRequestDto, List<EmployeeTimeline> employeeTimelines) {
		if (currentEmployee == null || createEmployeeRequestDto == null || employeeTimelines == null) {
			return;
		}

		if (createEmployeeRequestDto.getEmployment() == null) {
			return;
		}

		Optional<Employee> employeeOpt = employeeDao.findById(currentEmployee.getEmployeeId());
		if (employeeOpt.isEmpty()) {
			return;
		}

		if (createEmployeeRequestDto.getEmployment() == null
				|| createEmployeeRequestDto.getEmployment().getEmploymentDetails() == null) {
			return;
		}

		Employee employee = employeeOpt.get();

		EmployeePeriod currentEmployeePeriod = currentEmployee.getEmployeePeriod();
		ProbationPeriodDto newEmployeePeriod = new ProbationPeriodDto();

		CommonModuleUtils.setIfExists(
				() -> createEmployeeRequestDto.getEmployment().getEmploymentDetails().getProbationStartDate(),
				newEmployeePeriod::setStartDate);

		CommonModuleUtils.setIfExists(
				() -> createEmployeeRequestDto.getEmployment().getEmploymentDetails().getProbationEndDate(),
				newEmployeePeriod::setEndDate);

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
			CreateEmployeeRequestDto createEmployeeRequestDto, List<EmployeeTimeline> employeeTimelines) {

		if (createEmployeeRequestDto.getEmployment() == null) {
			return;
		}

		if (currentEmployee == null || employeeTimelines == null) {
			return;
		}

		Optional<Employee> employeeOpt = employeeDao.findById(currentEmployee.getEmployeeId());
		if (employeeOpt.isEmpty()) {
			return;
		}

		if (createEmployeeRequestDto.getEmployment() == null
				|| createEmployeeRequestDto.getEmployment().getEmploymentDetails() == null
				|| createEmployeeRequestDto.getEmployment().getEmploymentDetails().getEmploymentAllocation() == null) {
			return;
		}

		Employee employee = employeeOpt.get();

		EmploymentAllocation currentEmploymentAllocation = currentEmployee.getEmploymentAllocation();
		EmploymentAllocation newEmploymentAllocation = createEmployeeRequestDto.getEmployment()
			.getEmploymentDetails()
			.getEmploymentAllocation();

		if (currentEmploymentAllocation != null) {
			if (!newEmploymentAllocation.equals(currentEmploymentAllocation)) {
				employeeTimelines
					.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.EMPLOYMENT_ALLOCATION_CHANGED,
							currentEmploymentAllocation.toString(), newEmploymentAllocation.toString()));
			}
		}
		else {
			employeeTimelines.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.EMPLOYMENT_ALLOCATION_ADDED,
					null, newEmploymentAllocation.toString()));
		}
	}

	private void addSystemPermissionTimeline(Employee savedEmployee, EmployeeSystemPermissionsDto employeeRole,
			List<EmployeeTimeline> employeeTimelines) {
		if (savedEmployee == null || employeeRole == null || employeeTimelines == null) {
			return;
		}

		EnumMap<EpTimelineModuleType, Function<EmployeeSystemPermissionsDto, Role>> roleGetters = new EnumMap<>(
				EpTimelineModuleType.class);
		roleGetters.put(EpTimelineModuleType.PEOPLE, EmployeeSystemPermissionsDto::getPeopleRole);
		roleGetters.put(EpTimelineModuleType.ATTENDANCE, EmployeeSystemPermissionsDto::getAttendanceRole);
		roleGetters.put(EpTimelineModuleType.LEAVE, EmployeeSystemPermissionsDto::getLeaveRole);
		roleGetters.put(EpTimelineModuleType.ESIGN, EmployeeSystemPermissionsDto::getEsignRole);

		roleGetters.forEach((module, getter) -> {
			Role role = getter.apply(employeeRole);
			if (role != null) {
				String roleName = getRoleNameWithModule(role, module.getDisplayName());
				if (roleName != null) {
					employeeTimelines.add(createEmployeeTimeline(savedEmployee,
							EpEmployeeTimelineType.SYSTEM_PERMISSION_GRANTED, null, roleName));
				}
			}
		});
	}

	private void updateSystemPermissionTimeline(CurrentEmployeeDto currentEmployee,
			CreateEmployeeRequestDto createEmployeeRequestDto, List<EmployeeTimeline> employeeTimelines) {
		if (currentEmployee == null || createEmployeeRequestDto == null || employeeTimelines == null) {
			return;
		}

		Optional<Employee> employeeOpt = employeeDao.findById(currentEmployee.getEmployeeId());
		if (employeeOpt.isEmpty()) {
			return;
		}

		EmployeeRole currentEmployeeRole = currentEmployee.getEmployeeRole();
		if (currentEmployeeRole == null) {
			return;
		}

		EmployeeSystemPermissionsDto newEmployeeRole = createEmployeeRequestDto.getSystemPermissions();
		if (newEmployeeRole == null) {
			return;
		}

		Employee employee = employeeOpt.get();

		if (newEmployeeRole.getPeopleRole() != null && currentEmployeeRole.getPeopleRole() != null
				&& !currentEmployeeRole.getPeopleRole().equals(newEmployeeRole.getPeopleRole())) {
			String previousRoleName = getRoleNameWithModule(currentEmployeeRole.getPeopleRole(),
					EpTimelineModuleType.PEOPLE.getDisplayName());
			String newRoleName = getRoleNameWithModule(newEmployeeRole.getPeopleRole(),
					EpTimelineModuleType.PEOPLE.getDisplayName());
			employeeTimelines.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.SYSTEM_PERMISSION_CHANGED,
					previousRoleName, newRoleName));
		}

		if (newEmployeeRole.getLeaveRole() != null && currentEmployeeRole.getLeaveRole() != null
				&& !currentEmployeeRole.getLeaveRole().equals(newEmployeeRole.getLeaveRole())) {
			String previousRoleName = getRoleNameWithModule(currentEmployeeRole.getLeaveRole(),
					EpTimelineModuleType.LEAVE.getDisplayName());
			String newRoleName = getRoleNameWithModule(newEmployeeRole.getLeaveRole(),
					EpTimelineModuleType.LEAVE.getDisplayName());
			employeeTimelines.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.SYSTEM_PERMISSION_CHANGED,
					previousRoleName, newRoleName));
		}

		if (newEmployeeRole.getAttendanceRole() != null && currentEmployeeRole.getAttendanceRole() != null
				&& !currentEmployeeRole.getAttendanceRole().equals(newEmployeeRole.getAttendanceRole())) {
			String previousRoleName = getRoleNameWithModule(currentEmployeeRole.getAttendanceRole(),
					EpTimelineModuleType.ATTENDANCE.getDisplayName());
			String newRoleName = getRoleNameWithModule(newEmployeeRole.getAttendanceRole(),
					EpTimelineModuleType.ATTENDANCE.getDisplayName());
			employeeTimelines.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.SYSTEM_PERMISSION_CHANGED,
					previousRoleName, newRoleName));
		}

		if (newEmployeeRole.getEsignRole() != null && currentEmployeeRole.getEsignRole() != null
				&& !currentEmployeeRole.getEsignRole().equals(newEmployeeRole.getEsignRole())) {
			String previousRoleName = getRoleNameWithModule(currentEmployeeRole.getEsignRole(),
					EpTimelineModuleType.ESIGN.getDisplayName());
			String newRoleName = getRoleNameWithModule(newEmployeeRole.getEsignRole(),
					EpTimelineModuleType.ESIGN.getDisplayName());
			employeeTimelines.add(createEmployeeTimeline(employee, EpEmployeeTimelineType.SYSTEM_PERMISSION_CHANGED,
					previousRoleName, newRoleName));
		}
	}

	private String getRoleNameWithModule(Role role, String rolePrefix) {
		String roleStr = role.toString();

		if (roleStr.contains(RoleLevel.EMPLOYEE.name())) {
			return rolePrefix + RoleLevel.EMPLOYEE.getDisplayName();
		}
		else if (roleStr.contains(RoleLevel.ADMIN.name())) {
			return rolePrefix + RoleLevel.ADMIN.getDisplayName();
		}
		else if (roleStr.contains(RoleLevel.MANAGER.name())) {
			return rolePrefix + RoleLevel.MANAGER.getDisplayName();
		}
		else if (roleStr.contains(RoleLevel.SENDER.name())) {
			return rolePrefix + RoleLevel.SENDER.getDisplayName();
		}
		return null;
	}

}
