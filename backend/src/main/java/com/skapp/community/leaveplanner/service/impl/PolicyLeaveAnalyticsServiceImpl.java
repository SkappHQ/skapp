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
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.payload.LeaveCycleDetailsDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveDateWindowDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveMonthlyDurationDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveSpanDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeBreakdownFilterDto;
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
import com.skapp.community.leaveplanner.util.LeaveModuleUtil;
import com.skapp.community.leaveplanner.util.PolicyLeaveAccrualUtil;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.LocalDate;
import java.time.MonthDay;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.time.format.TextStyle;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.BiFunction;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyLeaveAnalyticsServiceImpl implements PolicyLeaveAnalyticsService {

	private static final String LEAVE_TREND_ANALYTICS = "Leave Trend";

	private final TimeZoneService timeZoneService;

	private final UserService userService;

	private final LeavePolicyService leavePolicyService;

	private final LeaveCycleService leaveCycleService;

	private final PolicyLeaveRequestDao policyLeaveRequestDao;

	private final PolicyLeaveTypeDao policyLeaveTypeDao;

	private final TeamDao teamDao;

	private final HolidayDao holidayDao;

	private final TimeConfigDao timeConfigDao;

	private final LeaveMapper leaveMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTeamLeaveTrendForTheYear(@NonNull PolicyTeamLeaveTrendFilterDto filterDto) {
		log.info("getTeamLeaveTrendForTheYear: execution started");
		requireLeavePoliciesEnabled();

		User currentUser = userService.getCurrentUser();
		Team team = teamDao.findByTeamIdAndIsActive(filterDto.getTeamId(), true)
			.orElseThrow(() -> new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND));
		validateTeamSupervision(currentUser, team);

		List<PolicyLeaveType> leaveTypes = resolveTrendLeaveTypes(filterDto.getLeaveTypeIds());
		PolicyLeaveDateWindowDto window = resolveTrendWindow(filterDto.getStartDate(), filterDto.getEndDate());

		Map<Long, Map<YearMonth, Double>> durations = sumApprovedLeaveByTypeAndMonth(window,
				leaveTypes.stream().map(PolicyLeaveType::getId).toList(), List.of(team.getTeamId()), null);

		PolicyLeaveTrendResponseDto responseDto = new PolicyLeaveTrendResponseDto();
		responseDto.setTotalLeaves(toMonthNameMap(window, sumByMonth(durations)));
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
	public ResponseEntityDto getLeaveTypeBreakdown(@NonNull PolicyLeaveTypeBreakdownFilterDto filterDto) {
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
		responseDto.setTotalLeaves(toMonthNameMap(window, sumByMonth(durations)));
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

	private <T> List<T> buildLeaveTypeMonthData(List<PolicyLeaveType> leaveTypes, PolicyLeaveDateWindowDto window,
			Map<Long, Map<YearMonth, Double>> durations,
			BiFunction<PolicyLeaveTypeBasicInfoResponseDto, Map<String, Float>, T> dataBuilder) {
		return leaveTypes.stream()
			.map(leaveType -> dataBuilder.apply(
					leaveMapper.policyLeaveTypeToPolicyLeaveTypeBasicInfoResponseDto(leaveType),
					toMonthNameMap(window, durations.get(leaveType.getId()))))
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
			addDuration(durations, duration.getLeaveTypeId(), YearMonth.of(duration.getYear(), duration.getMonth()),
					duration.getDurationDays());
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
		List<Holiday> holidays = holidayDao.findAllWithWorkLocationsByIsActiveTrueAndDateBetween(earliestStart,
				latestEnd);
		Map<Long, List<Holiday>> holidaysByWorkLocation = new HashMap<>();

		for (PolicyLeaveSpanDto span : multiMonthSpans) {
			List<Holiday> spanHolidays = holidaysByWorkLocation.computeIfAbsent(span.getWorkLocationId(),
					workLocationId -> holidaysForWorkLocation(holidays, workLocationId));
			splitAcrossMonths(durations, span, window, timeConfigs, spanHolidays);
		}

		return durations;
	}

	private void splitAcrossMonths(Map<Long, Map<YearMonth, Double>> durations, PolicyLeaveSpanDto span,
			PolicyLeaveDateWindowDto window, List<TimeConfig> timeConfigs, List<Holiday> holidays) {
		if (span.getDurationDays() == null) {
			return;
		}

		BiFunction<LocalDate, LocalDate, Double> dayCounter = (start,
				end) -> (double) LeaveModuleUtil.getWorkingDaysBetweenTwoDates(start, end, timeConfigs, holidays);
		double requestDays = dayCounter.apply(span.getStartDate(), span.getEndDate());
		if (requestDays <= 0) {
			log.warn("splitAcrossMonths: approved leave span has no working days, splitting by calendar days");
			dayCounter = (start, end) -> (double) (ChronoUnit.DAYS.between(start, end) + 1);
			requestDays = dayCounter.apply(span.getStartDate(), span.getEndDate());
		}

		double durationPerDay = span.getDurationDays() / requestDays;
		LocalDate from = latest(span.getStartDate(), window.getStartDate());
		LocalDate to = earliest(span.getEndDate(), window.getEndDate());
		YearMonth lastMonth = YearMonth.from(to);

		for (YearMonth month = YearMonth.from(from); !month.isAfter(lastMonth); month = month.plusMonths(1)) {
			double segmentDays = dayCounter.apply(latest(from, month.atDay(1)), earliest(to, month.atEndOfMonth()));
			if (segmentDays > 0) {
				addDuration(durations, span.getLeaveTypeId(), month, segmentDays * durationPerDay);
			}
		}
	}

	private List<Holiday> holidaysForWorkLocation(List<Holiday> holidays, Long workLocationId) {
		return holidays.stream()
			.filter(holiday -> holiday.getWorkLocations().isEmpty()
					|| (workLocationId != null && holiday.getWorkLocations()
						.stream()
						.anyMatch(workLocation -> workLocationId.equals(workLocation.getWorkLocationId()))))
			.toList();
	}

	private void addDuration(Map<Long, Map<YearMonth, Double>> durations, Long leaveTypeId, YearMonth month,
			Double durationDays) {
		if (durationDays == null) {
			return;
		}
		durations.computeIfAbsent(leaveTypeId, key -> new HashMap<>()).merge(month, durationDays, Double::sum);
	}

	private Map<YearMonth, Double> sumByMonth(Map<Long, Map<YearMonth, Double>> durations) {
		Map<YearMonth, Double> totals = new HashMap<>();
		durations.values()
			.forEach(durationsByMonth -> durationsByMonth
				.forEach((month, durationDays) -> totals.merge(month, durationDays, Double::sum)));
		return totals;
	}

	private Map<String, Float> toMonthNameMap(PolicyLeaveDateWindowDto window,
			Map<YearMonth, Double> durationsByMonth) {
		Map<String, Float> monthNameMap = new LinkedHashMap<>();
		YearMonth lastMonth = YearMonth.from(window.getEndDate());

		for (YearMonth month = YearMonth.from(window.getStartDate()); !month.isAfter(lastMonth); month = month
			.plusMonths(1)) {
			Double durationDays = durationsByMonth == null ? null : durationsByMonth.get(month);
			monthNameMap.merge(month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
					durationDays == null ? 0f : durationDays.floatValue(), Float::sum);
		}

		return monthNameMap;
	}

	private List<PolicyLeaveType> resolveTrendLeaveTypes(List<Long> leaveTypeIds) {
		if (isAllSelected(leaveTypeIds, PolicyLeaveConstant.ALL_LEAVE_TYPES_ID)) {
			return policyLeaveTypeDao.findAll(Sort.by(Sort.Direction.ASC, "id"));
		}

		List<PolicyLeaveType> leaveTypes = policyLeaveTypeDao.findAllById(leaveTypeIds);
		if (leaveTypes.size() != leaveTypeIds.stream().distinct().count()) {
			throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_NOT_FOUND);
		}
		return leaveTypes;
	}

	private List<PolicyLeaveType> resolveBreakdownLeaveTypes(List<Long> typeIds) {
		List<PolicyLeaveType> leaveTypes = isAllSelected(typeIds, PolicyLeaveConstant.ALL_LEAVE_TYPES_ID)
				? policyLeaveTypeDao.findAll(Sort.by(Sort.Direction.ASC, "id"))
				: policyLeaveTypeDao.findAllById(typeIds);
		return leaveTypes.stream().filter(leaveType -> Boolean.TRUE.equals(leaveType.getIsActive())).toList();
	}

	private boolean isAllSelected(List<Long> ids, long allSelectionId) {
		return CollectionUtils.isEmpty(ids) || ids.contains(allSelectionId);
	}

	private List<Long> resolveTeamIds(List<Long> teamIds) {
		return isAllSelected(teamIds, PolicyLeaveConstant.ALL_TEAMS_ID) ? List.of() : teamIds;
	}

	private PolicyLeaveDateWindowDto resolveTrendWindow(LocalDate startDate, LocalDate endDate) {
		if (startDate == null || endDate == null) {
			return resolveCurrentCycle();
		}

		int currentYear = timeZoneService.currentOrganizationDate().getYear();
		if (startDate.isAfter(endDate) || startDate.getYear() < currentYear - 1 || endDate
			.isAfter(startDate.plusMonths(PolicyLeaveConstant.MAX_ANALYTICS_WINDOW_MONTHS).minusDays(1))) {
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

	private void validateTeamSupervision(User currentUser, Team team) {
		if (LeaveModuleUtil.isUserSuperAdminOrLeaveAdmin(currentUser)) {
			return;
		}

		Long currentEmployeeId = currentUser.getEmployee().getEmployeeId();
		boolean isSupervisor = team.getEmployees()
			.stream()
			.anyMatch(employeeTeam -> Boolean.TRUE.equals(employeeTeam.getIsSupervisor())
					&& employeeTeam.getEmployee().getEmployeeId().equals(currentEmployeeId));
		if (!isSupervisor) {
			throw new EntityNotFoundException(
					PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_UNDER_CURRENT_EMPLOYEE_SUPERVISION,
					new String[] { "Team", LEAVE_TREND_ANALYTICS });
		}
	}

	private LocalDate latest(LocalDate first, LocalDate second) {
		return first.isAfter(second) ? first : second;
	}

	private LocalDate earliest(LocalDate first, LocalDate second) {
		return first.isBefore(second) ? first : second;
	}

	private void requireLeavePoliciesEnabled() {
		if (!leavePolicyService.isLeavePoliciesEnabled()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_NOT_ENABLED);
		}
	}

}
