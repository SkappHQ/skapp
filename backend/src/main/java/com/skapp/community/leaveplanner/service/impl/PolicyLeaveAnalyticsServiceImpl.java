package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.constant.PolicyLeaveConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.model.PolicyLeaveType_;
import com.skapp.community.leaveplanner.payload.LeaveCycleDetailsDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveDateWindowDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveMonthlyDurationDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveSpanDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeBreakdownFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveUtilizationFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyTeamLeaveTrendFilterDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTrendDataResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTrendResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeBreakdownDataResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeBasicInfoResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeBreakdownResponseDto;
import com.skapp.community.leaveplanner.repository.EmployeeLeavePolicyDao;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestDao;
import com.skapp.community.leaveplanner.repository.PolicyLeaveTypeDao;
import com.skapp.community.leaveplanner.service.LeaveCycleService;
import com.skapp.community.leaveplanner.service.LeavePolicyService;
import com.skapp.community.leaveplanner.service.PolicyLeaveAnalyticsService;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import com.skapp.community.leaveplanner.util.LeaveModuleUtil;
import com.skapp.community.leaveplanner.util.PolicyLeaveAccrualUtil;
import com.skapp.community.leaveplanner.util.PolicyLeaveAnalyticsUtil;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeTeamDao;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.MonthDay;
import java.time.YearMonth;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyLeaveAnalyticsServiceImpl implements PolicyLeaveAnalyticsService {

	private final TimeZoneService timeZoneService;

	private final UserService userService;

	private final LeavePolicyService leavePolicyService;

	private final LeaveCycleService leaveCycleService;

	private final PolicyLeaveRequestDao policyLeaveRequestDao;

	private final PolicyLeaveTypeDao policyLeaveTypeDao;

	private final EmployeeLeavePolicyDao employeeLeavePolicyDao;

	private final EmployeeDao employeeDao;

	private final EmployeeTeamDao employeeTeamDao;

	private final TeamDao teamDao;

	private final HolidayDao holidayDao;

	private final TimeConfigDao timeConfigDao;

	private final LeaveMapper leaveMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTeamLeaveTrendForTheYear(PolicyTeamLeaveTrendFilterDto filterDto) {
		log.info("getTeamLeaveTrendForTheYear: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		Team team = teamDao.findByTeamIdAndIsActive(filterDto.getTeamId(), true)
			.orElseThrow(() -> new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND));
		LeaveModuleUtil.validateTeamsForLeaveAnalytics(List.of(team.getTeamId()), currentUser, List.of(team));

		List<PolicyLeaveType> leaveTypes = resolveTrendLeaveTypes(filterDto.getLeaveTypeIds());
		PolicyLeaveDateWindowDto window = resolveTrendWindow(filterDto.getStartDate(), filterDto.getEndDate());

		Map<Long, Map<YearMonth, Double>> durations = sumApprovedLeaveByTypeAndMonth(window,
				leaveTypes.stream().map(PolicyLeaveType::getId).toList(), List.of(team.getTeamId()), null, null);

		PolicyLeaveTrendResponseDto responseDto = new PolicyLeaveTrendResponseDto();
		responseDto.setTotalLeaves(
				PolicyLeaveAnalyticsUtil.toMonthNameMap(window, PolicyLeaveAnalyticsUtil.sumByMonth(durations)));
		responseDto
			.setTotalLeavesWithType(buildLeaveTypeMonthData(leaveTypes, window, durations, (leaveType, monthData) -> {
				PolicyLeaveTrendDataResponseDto dataResponseDto = new PolicyLeaveTrendDataResponseDto();
				dataResponseDto.setLeaveType(leaveType);
				dataResponseDto.setLeaveTrendData(monthData);
				return dataResponseDto;
			}));

		log.info("getTeamLeaveTrendForTheYear: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getLeaveTypeBreakdown(PolicyLeaveTypeBreakdownFilterDto filterDto) {
		log.info("getLeaveTypeBreakdown: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		Long supervisorEmployeeId = LeaveModuleUtil.isUserSuperAdminOrLeaveAdmin(currentUser) ? null
				: currentUser.getEmployee().getEmployeeId();

		List<Long> teamIds = resolveTeamIds(filterDto.getTeamIds());
		if (!teamIds.isEmpty()) {
			LeaveModuleUtil.validateTeamsForLeaveAnalytics(teamIds, currentUser, teamDao.findByTeamIdIn(teamIds));
		}

		List<PolicyLeaveType> leaveTypes = resolveBreakdownLeaveTypes(filterDto.getTypeIds());
		PolicyLeaveDateWindowDto window = resolveCurrentCycle();

		Map<Long, Map<YearMonth, Double>> durations = sumApprovedLeaveByTypeAndMonth(window,
				leaveTypes.stream().map(PolicyLeaveType::getId).toList(), teamIds, supervisorEmployeeId, null);

		log.info("getLeaveTypeBreakdown: execution ended");
		return new ResponseEntityDto(false, buildLeaveTypeBreakdownResponse(leaveTypes, window, durations));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getEmployeeLeaveUtilization(Long employeeId, PolicyLeaveUtilizationFilterDto filterDto) {
		log.info("getEmployeeLeaveUtilization: execution started");
		requireLeavePoliciesEnabled();

		Employee employee = employeeDao.findByEmployeeId(employeeId)
			.orElseThrow(() -> new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND));
		validateEmployeeUnderCurrentUserSupervision(employee);

		PolicyLeaveDateWindowDto window = resolveCurrentCycle();
		List<PolicyLeaveType> leaveTypes;
		Map<Long, Map<YearMonth, Double>> durations;

		if (PolicyLeaveAnalyticsUtil.isAllSelected(filterDto.getLeaveTypeIds(),
				PolicyLeaveConstant.ALL_LEAVE_TYPES_ID)) {
			durations = sumApprovedLeaveByTypeAndMonth(window, null, List.of(), null, employeeId);
			leaveTypes = resolveEmployeeLeaveTypes(employeeId, durations.keySet());
		}
		else {
			leaveTypes = resolveTrendLeaveTypes(filterDto.getLeaveTypeIds());
			durations = sumApprovedLeaveByTypeAndMonth(window, leaveTypes.stream().map(PolicyLeaveType::getId).toList(),
					List.of(), null, employeeId);
		}

		log.info("getEmployeeLeaveUtilization: execution ended");
		return new ResponseEntityDto(false, buildLeaveTypeBreakdownResponse(leaveTypes, window, durations));
	}

	private PolicyLeaveTypeBreakdownResponseDto buildLeaveTypeBreakdownResponse(List<PolicyLeaveType> leaveTypes,
			PolicyLeaveDateWindowDto window, Map<Long, Map<YearMonth, Double>> durations) {
		PolicyLeaveTypeBreakdownResponseDto responseDto = new PolicyLeaveTypeBreakdownResponseDto();
		responseDto.setTotalLeaves(
				PolicyLeaveAnalyticsUtil.toMonthNameMap(window, PolicyLeaveAnalyticsUtil.sumByMonth(durations)));
		responseDto
			.setTotalLeavesWithType(buildLeaveTypeMonthData(leaveTypes, window, durations, (leaveType, monthData) -> {
				PolicyLeaveTypeBreakdownDataResponseDto dataResponseDto = new PolicyLeaveTypeBreakdownDataResponseDto();
				dataResponseDto.setLeaveType(leaveType);
				dataResponseDto.setLeaveUtilizationData(monthData);
				return dataResponseDto;
			}));
		return responseDto;
	}

	private <T> List<T> buildLeaveTypeMonthData(List<PolicyLeaveType> leaveTypes, PolicyLeaveDateWindowDto window,
			Map<Long, Map<YearMonth, Double>> durations,
			BiFunction<PolicyLeaveTypeBasicInfoResponseDto, Map<String, Float>, T> dataBuilder) {
		return leaveTypes.stream()
			.map(leaveType -> dataBuilder.apply(
					leaveMapper.policyLeaveTypeToPolicyLeaveTypeBasicInfoResponseDto(leaveType),
					PolicyLeaveAnalyticsUtil.toMonthNameMap(window, durations.get(leaveType.getId()))))
			.toList();
	}

	private Map<Long, Map<YearMonth, Double>> sumApprovedLeaveByTypeAndMonth(PolicyLeaveDateWindowDto window,
			List<Long> leaveTypeIds, List<Long> teamIds, Long supervisorEmployeeId, Long employeeId) {
		Map<Long, Map<YearMonth, Double>> durations = new HashMap<>();
		if (leaveTypeIds != null && leaveTypeIds.isEmpty()) {
			return durations;
		}

		List<PolicyLeaveMonthlyDurationDto> singleMonthDurations = policyLeaveRequestDao
			.findApprovedSingleMonthDurations(window.getStartDate(), window.getEndDate(), leaveTypeIds, teamIds,
					supervisorEmployeeId, employeeId);
		for (PolicyLeaveMonthlyDurationDto duration : singleMonthDurations) {
			PolicyLeaveAnalyticsUtil.addDuration(durations, duration.getLeaveTypeId(),
					YearMonth.of(duration.getYear(), duration.getMonth()), duration.getDurationDays());
		}

		List<PolicyLeaveSpanDto> multiMonthSpans = policyLeaveRequestDao.findApprovedMultiMonthSpans(
				window.getStartDate(), window.getEndDate(), leaveTypeIds, teamIds, supervisorEmployeeId, employeeId);
		if (multiMonthSpans.isEmpty()) {
			return durations;
		}

		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		LocalDate earliestStart = multiMonthSpans.stream()
			.map(PolicyLeaveSpanDto::getStartDate)
			.min(LocalDate::compareTo)
			.orElse(window.getStartDate());
		LocalDate latestEnd = multiMonthSpans.stream()
			.map(PolicyLeaveSpanDto::getEndDate)
			.max(LocalDate::compareTo)
			.orElse(window.getEndDate());
		List<Holiday> holidays = holidayDao.findAllByIsActiveTrueAndDateBetween(earliestStart, latestEnd);
		Map<Long, List<Holiday>> holidaysByWorkLocation = new HashMap<>();

		for (PolicyLeaveSpanDto span : multiMonthSpans) {
			List<Holiday> spanHolidays = holidaysByWorkLocation.computeIfAbsent(span.getWorkLocationId(),
					workLocationId -> PolicyLeaveAnalyticsUtil.holidaysForWorkLocation(holidays, workLocationId));
			PolicyLeaveAnalyticsUtil.splitAcrossMonths(durations, span, window, timeConfigs, spanHolidays);
		}

		return durations;
	}

	private List<PolicyLeaveType> resolveTrendLeaveTypes(List<Long> leaveTypeIds) {
		if (PolicyLeaveAnalyticsUtil.isAllSelected(leaveTypeIds, PolicyLeaveConstant.ALL_LEAVE_TYPES_ID)) {
			return policyLeaveTypeDao.findAll(Sort.by(Sort.Direction.ASC, PolicyLeaveType_.ID));
		}

		List<PolicyLeaveType> leaveTypes = policyLeaveTypeDao.findAllById(leaveTypeIds);
		if (leaveTypes.size() != leaveTypeIds.stream().distinct().count()) {
			throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_NOT_FOUND);
		}
		return leaveTypes;
	}

	private List<PolicyLeaveType> resolveBreakdownLeaveTypes(List<Long> typeIds) {
		List<PolicyLeaveType> leaveTypes = PolicyLeaveAnalyticsUtil.isAllSelected(typeIds,
				PolicyLeaveConstant.ALL_LEAVE_TYPES_ID)
						? policyLeaveTypeDao.findAll(Sort.by(Sort.Direction.ASC, PolicyLeaveType_.ID))
						: policyLeaveTypeDao.findAllById(typeIds);
		return leaveTypes.stream().filter(leaveType -> Boolean.TRUE.equals(leaveType.getIsActive())).toList();
	}

	private List<PolicyLeaveType> resolveEmployeeLeaveTypes(Long employeeId, Collection<Long> usedLeaveTypeIds) {
		Set<Long> leaveTypeIds = Stream
			.concat(employeeLeavePolicyDao
				.findByEmployeeIdAndStatusOrderByPolicyNameAsc(employeeId, EmployeeLeavePolicyStatus.ACTIVE)
				.stream()
				.map(EmployeeLeavePolicy::getPolicy)
				.map(LeavePolicy::getLeaveType)
				.filter(Objects::nonNull)
				.map(PolicyLeaveType::getId), usedLeaveTypeIds.stream())
			.collect(Collectors.toSet());
		if (leaveTypeIds.isEmpty()) {
			return List.of();
		}

		return policyLeaveTypeDao.findAllById(leaveTypeIds)
			.stream()
			.sorted(Comparator.comparing(PolicyLeaveType::getId))
			.toList();
	}

	private void validateEmployeeUnderCurrentUserSupervision(Employee employee) {
		User currentUser = userService.getCurrentUser();
		if (LeaveModuleUtil.isUserSuperAdminOrLeaveAdmin(currentUser)) {
			return;
		}

		Long currentEmployeeId = currentUser.getEmployee().getEmployeeId();
		if (!employeeDao.existsManagerForEmployee(employee.getEmployeeId(), currentEmployeeId)
				&& !employeeTeamDao.existsEmployeeInSupervisedTeam(employee.getEmployeeId(), currentEmployeeId)) {
			throw new EntityNotFoundException(
					PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_UNDER_CURRENT_EMPLOYEE_SUPERVISION,
					new String[] { PolicyLeaveConstant.SUPERVISION_TARGET_EMPLOYEE,
							PolicyLeaveConstant.SUPERVISION_ANALYTICS_LEAVE_UTILIZATION });
		}
	}

	private List<Long> resolveTeamIds(List<Long> teamIds) {
		return PolicyLeaveAnalyticsUtil.isAllSelected(teamIds, PolicyLeaveConstant.ALL_TEAMS_ID) ? List.of() : teamIds;
	}

	private PolicyLeaveDateWindowDto resolveTrendWindow(LocalDate startDate, LocalDate endDate) {
		if (startDate == null || endDate == null) {
			return resolveCurrentCycle();
		}

		int currentYear = timeZoneService.currentOrganizationDate().getYear();
		if (startDate.isAfter(endDate) || startDate.getYear() < currentYear - 1) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_START_DATE_END_DATE_NOT_VALID);
		}
		return new PolicyLeaveDateWindowDto(startDate, endDate);
	}

	private PolicyLeaveDateWindowDto resolveCurrentCycle() {
		LeaveCycleDetailsDto leaveCycle = leaveCycleService.getLeaveCycleConfigs();
		MonthDay cycleAnchor = MonthDay.of(leaveCycle.getStartMonth(), leaveCycle.getStartDate());
		int cycleYear = PolicyLeaveAccrualUtil
			.resolveCycleContaining(timeZoneService.currentOrganizationDate(), cycleAnchor)
			.getStartDate()
			.getYear();
		return PolicyLeaveAccrualUtil.resolveCycle(cycleYear, cycleAnchor);
	}

	private void requireLeavePoliciesEnabled() {
		if (!leavePolicyService.isLeavePoliciesEnabled()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_NOT_ENABLED);
		}
	}

}
