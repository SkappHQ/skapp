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
import java.time.format.TextStyle;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

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

		Map<Long, Map<Integer, Double>> durations = sumApprovedLeaveByTypeAndMonth(window,
				leaveTypes.stream().map(PolicyLeaveType::getId).toList(), List.of(team.getTeamId()), null);

		PolicyLeaveTrendResponseDto responseDto = new PolicyLeaveTrendResponseDto();
		responseDto.setTotalLeaves(toMonthNameMap(window, sumByMonth(durations)));
		responseDto.setTotalLeavesWithType(leaveTypes.stream().map(leaveType -> {
			PolicyLeaveTrendDataResponseDto dataResponseDto = new PolicyLeaveTrendDataResponseDto();
			dataResponseDto.setLeaveType(leaveMapper.policyLeaveTypeToPolicyLeaveTypeBasicInfoResponseDto(leaveType));
			dataResponseDto.setLeaveTrendData(toMonthNameMap(window, durations.get(leaveType.getId())));
			return dataResponseDto;
		}).toList());

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

		List<PolicyLeaveType> leaveTypes = resolveBreakdownLeaveTypes(filterDto.getTypeIds());
		PolicyLeaveDateWindowDto window = resolveCurrentCycle();

		Map<Long, Map<Integer, Double>> durations = sumApprovedLeaveByTypeAndMonth(window,
				leaveTypes.stream().map(PolicyLeaveType::getId).toList(), resolveTeamIds(filterDto.getTeamIds()),
				supervisorEmployeeId);

		PolicyLeaveTypeBreakdownResponseDto responseDto = new PolicyLeaveTypeBreakdownResponseDto();
		responseDto.setTotalLeaves(toMonthNameMap(window, sumByMonth(durations)));
		responseDto.setTotalLeavesWithType(leaveTypes.stream().map(leaveType -> {
			PolicyLeaveTypeBreakdownDataResponseDto dataResponseDto = new PolicyLeaveTypeBreakdownDataResponseDto();
			dataResponseDto.setLeaveType(leaveMapper.policyLeaveTypeToPolicyLeaveTypeBasicInfoResponseDto(leaveType));
			dataResponseDto.setLeaveUtilizationData(toMonthNameMap(window, durations.get(leaveType.getId())));
			return dataResponseDto;
		}).toList());

		log.info("getLeaveTypeBreakdown: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	private Map<Long, Map<Integer, Double>> sumApprovedLeaveByTypeAndMonth(PolicyLeaveDateWindowDto window,
			List<Long> leaveTypeIds, List<Long> teamIds, Long supervisorEmployeeId) {
		Map<Long, Map<Integer, Double>> durations = new HashMap<>();
		if (leaveTypeIds.isEmpty()) {
			return durations;
		}

		List<PolicyLeaveMonthlyDurationDto> singleMonthDurations = policyLeaveRequestDao
			.findApprovedSingleMonthDurations(window.getStartDate(), window.getEndDate(), leaveTypeIds, teamIds,
					supervisorEmployeeId);
		for (PolicyLeaveMonthlyDurationDto duration : singleMonthDurations) {
			addDuration(durations, duration.getLeaveTypeId(), duration.getMonth(), duration.getDurationDays());
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

		for (PolicyLeaveSpanDto span : multiMonthSpans) {
			splitAcrossMonths(durations, span, window, timeConfigs,
					holidaysForWorkLocation(holidays, span.getWorkLocationId()));
		}

		return durations;
	}

	private void splitAcrossMonths(Map<Long, Map<Integer, Double>> durations, PolicyLeaveSpanDto span,
			PolicyLeaveDateWindowDto window, List<TimeConfig> timeConfigs, List<Holiday> holidays) {
		float requestWorkingDays = LeaveModuleUtil.getWorkingDaysBetweenTwoDates(span.getStartDate(), span.getEndDate(),
				timeConfigs, holidays);
		if (requestWorkingDays <= 0f || span.getDurationDays() == null) {
			return;
		}

		double durationPerWorkingDay = span.getDurationDays() / requestWorkingDays;
		LocalDate from = latest(span.getStartDate(), window.getStartDate());
		LocalDate to = earliest(span.getEndDate(), window.getEndDate());
		YearMonth lastMonth = YearMonth.from(to);

		for (YearMonth month = YearMonth.from(from); !month.isAfter(lastMonth); month = month.plusMonths(1)) {
			float segmentWorkingDays = LeaveModuleUtil.getWorkingDaysBetweenTwoDates(latest(from, month.atDay(1)),
					earliest(to, month.atEndOfMonth()), timeConfigs, holidays);
			if (segmentWorkingDays > 0f) {
				addDuration(durations, span.getLeaveTypeId(), month.getMonthValue(),
						segmentWorkingDays * durationPerWorkingDay);
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

	private void addDuration(Map<Long, Map<Integer, Double>> durations, Long leaveTypeId, Integer month,
			Double durationDays) {
		if (durationDays == null) {
			return;
		}
		durations.computeIfAbsent(leaveTypeId, key -> new HashMap<>()).merge(month, durationDays, Double::sum);
	}

	private Map<Integer, Double> sumByMonth(Map<Long, Map<Integer, Double>> durations) {
		Map<Integer, Double> totals = new HashMap<>();
		durations.values()
			.forEach(durationsByMonth -> durationsByMonth
				.forEach((month, durationDays) -> totals.merge(month, durationDays, Double::sum)));
		return totals;
	}

	private Map<String, Float> toMonthNameMap(PolicyLeaveDateWindowDto window, Map<Integer, Double> durationsByMonth) {
		Map<String, Float> monthNameMap = new LinkedHashMap<>();
		YearMonth lastMonth = YearMonth.from(window.getEndDate());

		for (YearMonth month = YearMonth.from(window.getStartDate()); !month.isAfter(lastMonth); month = month
			.plusMonths(1)) {
			Double durationDays = durationsByMonth == null ? null : durationsByMonth.get(month.getMonthValue());
			monthNameMap.put(month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
					durationDays == null ? 0f : durationDays.floatValue());
		}

		return monthNameMap;
	}

	private List<PolicyLeaveType> resolveTrendLeaveTypes(List<Long> leaveTypeIds) {
		if (isAllSelected(leaveTypeIds)) {
			return policyLeaveTypeDao.findAll(Sort.by(Sort.Direction.ASC, "id"));
		}

		List<PolicyLeaveType> leaveTypes = policyLeaveTypeDao.findAllById(leaveTypeIds);
		if (leaveTypes.size() != leaveTypeIds.stream().distinct().count()) {
			throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_POLICY_LEAVE_TYPE_NOT_FOUND);
		}
		return leaveTypes;
	}

	private List<PolicyLeaveType> resolveBreakdownLeaveTypes(List<Long> typeIds) {
		List<PolicyLeaveType> leaveTypes = isAllSelected(typeIds)
				? policyLeaveTypeDao.findAll(Sort.by(Sort.Direction.ASC, "id"))
				: policyLeaveTypeDao.findAllById(typeIds);
		return leaveTypes.stream().filter(leaveType -> Boolean.TRUE.equals(leaveType.getIsActive())).toList();
	}

	private boolean isAllSelected(List<Long> ids) {
		return CollectionUtils.isEmpty(ids) || ids.contains(PolicyLeaveConstant.ALL_TEAMS_ID);
	}

	private List<Long> resolveTeamIds(List<Long> teamIds) {
		return isAllSelected(teamIds) ? List.of() : teamIds;
	}

	private PolicyLeaveDateWindowDto resolveTrendWindow(LocalDate startDate, LocalDate endDate) {
		if (startDate == null || endDate == null) {
			return resolveCurrentCycle();
		}

		int currentYear = timeZoneService.currentOrganizationDate().getYear();
		if (startDate.getYear() < currentYear - 1 || endDate.getYear() < currentYear - 1) {
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
