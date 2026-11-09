package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.constant.PolicyLeaveConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest_;
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.model.PolicyLeaveType_;
import com.skapp.community.leaveplanner.payload.LeaveCycleDetailsDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveDateWindowDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveMonthlyDurationDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveSpanDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeBreakdownFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyTeamLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyTeamLeaveTrendFilterDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTrendDataResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTrendResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeBreakdownDataResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeBasicInfoResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyLeaveTypeBreakdownResponseDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestDao;
import com.skapp.community.leaveplanner.repository.PolicyLeaveTypeDao;
import com.skapp.community.leaveplanner.service.LeaveCycleService;
import com.skapp.community.leaveplanner.service.LeavePolicyService;
import com.skapp.community.leaveplanner.service.PolicyLeaveAnalyticsService;
import com.skapp.community.leaveplanner.type.LeaveRequestSort;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.MonthDay;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.stream.Collectors;

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

	private final TeamDao teamDao;

	private final EmployeeDao employeeDao;

	private final EmployeeTeamDao employeeTeamDao;

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
				leaveTypes.stream().map(PolicyLeaveType::getId).toList(), List.of(team.getTeamId()), null);

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
				leaveTypes.stream().map(PolicyLeaveType::getId).toList(), teamIds, supervisorEmployeeId);

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

		log.info("getLeaveTypeBreakdown: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTeamLeaveHistory(Long teamId, PolicyTeamLeaveHistoryFilterDto filterDto) {
		log.info("getTeamLeaveHistory: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		Team team = teamDao.findByTeamIdAndIsActive(teamId, true)
			.orElseThrow(() -> new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND));
		LeaveModuleUtil.validateTeamsForLeaveAnalytics(List.of(team.getTeamId()), currentUser, List.of(team));
		validateTeamMembers(team, filterDto.getTeamMemberIds());

		PolicyLeaveDateWindowDto window = resolveHistoryWindow(filterDto.getStartDate(), filterDto.getEndDate());
		Page<PolicyLeaveRequest> leaveRequests = policyLeaveRequestDao.findLeaveHistory(team.getTeamId(),
				filterDto.getTeamMemberIds(), window.getStartDate(), window.getEndDate(), filterDto,
				resolveHistoryPageable(filterDto));

		log.info("getTeamLeaveHistory: execution ended");
		return new ResponseEntityDto(false, toPageDto(leaveRequests,
				leaveMapper.policyLeaveRequestListToPolicyTeamLeaveHistoryResponseDtoList(leaveRequests.getContent())));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getEmployeeLeaveHistory(Long employeeId, PolicyLeaveHistoryFilterDto filterDto) {
		log.info("getEmployeeLeaveHistory: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		Employee employee = employeeDao.findById(employeeId)
			.orElseThrow(() -> new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND));
		validateEmployeeUnderSupervision(currentUser, employee);

		PolicyLeaveDateWindowDto window = resolveHistoryWindow(filterDto.getStartDate(), filterDto.getEndDate());
		Page<PolicyLeaveRequest> leaveRequests = policyLeaveRequestDao.findLeaveHistory(null,
				List.of(employee.getEmployeeId()), window.getStartDate(), window.getEndDate(), filterDto,
				resolveHistoryPageable(filterDto));

		log.info("getEmployeeLeaveHistory: execution ended");
		return new ResponseEntityDto(false, toPageDto(leaveRequests,
				leaveMapper.policyLeaveRequestListToPolicyLeaveHistoryResponseDtoList(leaveRequests.getContent())));
	}

	private void validateEmployeeUnderSupervision(User currentUser, Employee employee) {
		if (LeaveModuleUtil.isUserSuperAdminOrLeaveAdmin(currentUser)) {
			return;
		}

		Long currentEmployeeId = currentUser.getEmployee().getEmployeeId();
		boolean isDirectManager = employee.getEmployeeManagers()
			.stream()
			.anyMatch(employeeManager -> employeeManager.getManager().getEmployeeId().equals(currentEmployeeId));

		if (!isDirectManager
				&& !employeeTeamDao.existsEmployeeInSupervisedTeam(employee.getEmployeeId(), currentEmployeeId)) {
			throw new EntityNotFoundException(
					PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_UNDER_CURRENT_EMPLOYEE_SUPERVISION,
					new String[] { PolicyLeaveConstant.EMPLOYEE_ANALYTICS_SUBJECT,
							PolicyLeaveConstant.LEAVE_HISTORY_ANALYTICS });
		}
	}

	private void validateTeamMembers(Team team, List<Long> teamMemberIds) {
		if (teamMemberIds == null) {
			return;
		}

		Set<Long> memberIds = team.getEmployees()
			.stream()
			.map(employeeTeam -> employeeTeam.getEmployee().getEmployeeId())
			.collect(Collectors.toSet());
		if (!memberIds.containsAll(teamMemberIds)) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_MEMBER_IDS_NOT_VALID);
		}
	}

	private PolicyLeaveDateWindowDto resolveHistoryWindow(LocalDate startDate, LocalDate endDate) {
		if (startDate == null || endDate == null) {
			return resolveCurrentCycle();
		}

		if (startDate.isAfter(endDate)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_START_DATE_END_DATE_NOT_VALID);
		}
		return new PolicyLeaveDateWindowDto(startDate, endDate);
	}

	private Pageable resolveHistoryPageable(PolicyLeaveHistoryFilterDto filterDto) {
		LeaveRequestSort sortKey = filterDto.getSortKey() == null ? LeaveRequestSort.START_DATE
				: filterDto.getSortKey();
		Sort.Direction sortOrder = filterDto.getSortOrder() == null ? Sort.Direction.DESC : filterDto.getSortOrder();
		Sort sort = Sort.by(sortOrder, sortKey.toString()).and(Sort.by(sortOrder, PolicyLeaveRequest_.ID));
		return Boolean.TRUE.equals(filterDto.getIsExport()) ? Pageable.unpaged(sort)
				: PageRequest.of(filterDto.getPage(), filterDto.getSize(), sort);
	}

	private PageDto toPageDto(Page<PolicyLeaveRequest> leaveRequests, List<?> items) {
		PageDto pageDto = new PageDto();
		pageDto.setCurrentPage(leaveRequests.getNumber());
		pageDto.setTotalPages(leaveRequests.getTotalPages());
		pageDto.setTotalItems(leaveRequests.getTotalElements());
		pageDto.setItems(items);
		return pageDto;
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
			List<Long> leaveTypeIds, List<Long> teamIds, Long supervisorEmployeeId) {
		Map<Long, Map<YearMonth, Double>> durations = new HashMap<>();
		if (leaveTypeIds.isEmpty()) {
			return durations;
		}

		List<PolicyLeaveMonthlyDurationDto> singleMonthDurations = policyLeaveRequestDao
			.findApprovedSingleMonthDurations(window.getStartDate(), window.getEndDate(), leaveTypeIds, teamIds,
					supervisorEmployeeId);
		for (PolicyLeaveMonthlyDurationDto duration : singleMonthDurations) {
			PolicyLeaveAnalyticsUtil.addDuration(durations, duration.getLeaveTypeId(),
					YearMonth.of(duration.getYear(), duration.getMonth()), duration.getDurationDays());
		}

		List<PolicyLeaveSpanDto> multiMonthSpans = policyLeaveRequestDao.findApprovedMultiMonthSpans(
				window.getStartDate(), window.getEndDate(), leaveTypeIds, teamIds, supervisorEmployeeId);
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
