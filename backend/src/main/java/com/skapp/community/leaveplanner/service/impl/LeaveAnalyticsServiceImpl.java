package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.model.LeaveType;
import com.skapp.community.leaveplanner.payload.AdminEmployeesOnLeaveDto;
import com.skapp.community.leaveplanner.payload.AdminOnLeaveDto;
import com.skapp.community.leaveplanner.payload.AverageLeaveConsumptionDto;
import com.skapp.community.leaveplanner.payload.EmployeeEntitlementTeamJobRoleDto;
import com.skapp.community.leaveplanner.payload.EmployeeLeaveEntitlementsDto;
import com.skapp.community.leaveplanner.payload.EmployeeLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.EmployeeLeaveReportResponseDto;
import com.skapp.community.leaveplanner.payload.EmployeeLeaveRequestDto;
import com.skapp.community.leaveplanner.payload.EmployeeLeaveRequestListResponseDto;
import com.skapp.community.leaveplanner.payload.EmployeeLeaveRequestResponseDto;
import com.skapp.community.leaveplanner.payload.EmployeesOnLeaveByTeamDto;
import com.skapp.community.leaveplanner.payload.EmployeesOnLeaveFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveAnalyticsFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveCycleDetailsDto;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementEmployeeDto;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementReportDto;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementResponseDto;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementsFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveReportDto;
import com.skapp.community.leaveplanner.payload.LeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveRequestsEntitlementsCustoms;
import com.skapp.community.leaveplanner.payload.LeaveTrendDataResponseDto;
import com.skapp.community.leaveplanner.payload.LeaveTrendFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveTrendResponseDto;
import com.skapp.community.leaveplanner.payload.LeaveUtilizationDataResponseDto;
import com.skapp.community.leaveplanner.payload.LeaveUtilizationFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveUtilizationResponseDto;
import com.skapp.community.leaveplanner.payload.ManagerLeaveTrendFilterDto;
import com.skapp.community.leaveplanner.payload.ManagerSummarizedTeamResponseDto;
import com.skapp.community.leaveplanner.payload.ManagerTeamResourceAvailabilityDto;
import com.skapp.community.leaveplanner.payload.ManagerTeamResponseDto;
import com.skapp.community.leaveplanner.payload.OnLeaveByTeamDto;
import com.skapp.community.leaveplanner.payload.OrganizationLeaveTrendForTheYearFilterDto;
import com.skapp.community.leaveplanner.payload.OrganizationalAbsenceRateAnalyticsDto;
import com.skapp.community.leaveplanner.payload.OrganizationalLeaveAnalyticsKPIDto;
import com.skapp.community.leaveplanner.payload.TeamFilterDto;
import com.skapp.community.leaveplanner.payload.TeamLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.TeamLeaveSummaryResponseDto;
import com.skapp.community.leaveplanner.payload.TeamLeaveTrendForTheYearFilterDto;
import com.skapp.community.leaveplanner.payload.TeamResourceAvailabilityResponseDto;
import com.skapp.community.leaveplanner.payload.request.AllLeaveRequestsResponseDto;
import com.skapp.community.leaveplanner.payload.request.EmployeesOnLeavePeriodFilterDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeCustomEntitlementReportExportDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeCustomEntitlementResponseDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeLeaveEntitlementReportExportDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeLeaveRequestReportExportDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeLeaveRequestReportQueryDto;
import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import com.skapp.community.leaveplanner.repository.LeaveEntitlementDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.leaveplanner.repository.LeaveTypeDao;
import com.skapp.community.leaveplanner.repository.projection.LeaveTrendByDay;
import com.skapp.community.leaveplanner.repository.projection.LeaveTrendByMonth;
import com.skapp.community.leaveplanner.repository.projection.LeaveTypeBreakDown;
import com.skapp.community.leaveplanner.repository.projection.LeaveUtilizationByEmployeeMonthly;
import com.skapp.community.leaveplanner.repository.projection.ManagerLeaveTrend;
import com.skapp.community.leaveplanner.repository.projection.OrganizationLeaveTrendForTheYear;
import com.skapp.community.leaveplanner.repository.projection.TeamLeaveCountByType;
import com.skapp.community.leaveplanner.repository.projection.TeamLeaveTrendForTheYear;
import com.skapp.community.leaveplanner.service.LeaveAnalyticsService;
import com.skapp.community.leaveplanner.service.LeaveCycleService;
import com.skapp.community.leaveplanner.type.EmployeeAvailabilityStatus;
import com.skapp.community.leaveplanner.type.OrganizationalLeaveAnalyticsKPIAbsenceType;
import com.skapp.community.leaveplanner.type.OrganizationalLeaveAnalyticsKPIType;
import com.skapp.community.leaveplanner.util.LeaveModuleUtil;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.model.JobFamily;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeFilterDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeDetailedResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeResponseDto;
import com.skapp.community.peopleplanner.payload.response.HolidayResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeTeamDao;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.repository.JobFamilyDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.time.Year;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;

import static java.time.temporal.TemporalAdjusters.firstDayOfMonth;
import static java.time.temporal.TemporalAdjusters.lastDayOfMonth;

@Service
@Slf4j
@RequiredArgsConstructor
public class LeaveAnalyticsServiceImpl implements LeaveAnalyticsService {

	private final LeaveCycleService leaveCycleService;

	private final UserDao userDao;

	private final HolidayDao holidayDao;

	private final TimeConfigDao timeConfigDao;

	private final LeaveRequestDao leaveRequestDao;

	private final LeaveTypeDao leaveTypeDao;

	private final LeaveMapper leaveMapper;

	private final EmployeeDao employeeDao;

	private final UserService userService;

	private final JobFamilyDao jobFamilyDao;

	private final TeamDao teamDao;

	private final PeopleMapper peopleMapper;

	private final LeaveEntitlementDao leaveEntitlementDao;

	private final PageTransformer pageTransformer;

	private final EmployeeTeamDao employeeTeamDao;

	private final OrganizationService organizationService;

	public static Map<String, Float> mapMonthKeysToName(LocalDate startDate, LocalDate endDate,
			Map<Integer, Double> leaveData) {
		Map<String, Float> totalLeavesWithMonthsResultsSet = new LinkedHashMap<>();
		int startMonth = startDate.getMonthValue();
		int numberOfMonths = LeaveModuleUtil.getNumberOfMonthsBetweenTwoDates(startDate, endDate);

		for (int month = startMonth; month <= numberOfMonths + startMonth; month++) {
			int monthIndex = month > 12 ? month - 12 : month;
			totalLeavesWithMonthsResultsSet.put(Month.of(monthIndex).getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
					leaveData == null || leaveData.get(monthIndex) == null ? 0
							: leaveData.get(monthIndex).floatValue());
		}
		return totalLeavesWithMonthsResultsSet;
	}

	public static int addUpWorkingDaysForAllEmployee(List<Employee> employees, LocalDate startDate, LocalDate endDate,
			List<TimeConfig> timeConfigs, List<LocalDate> holidays, String organizationTimeZone) {
		int totalWorkingDays = 0;
		for (Employee employee : employees) {
			if (employee.getJoinDate() != null && startDate.isBefore(employee.getJoinDate())
					&& employee.getTerminationDate() != null && endDate.isAfter(employee.getTerminationDate())) {
				totalWorkingDays = totalWorkingDays
						+ CommonModuleUtils.getWorkingDaysBetweenTwoDates(employee.getJoinDate(),
								employee.getTerminationDate(), timeConfigs, holidays, organizationTimeZone);
			}
			else if (employee.getJoinDate() != null && startDate.isBefore(employee.getJoinDate())
					&& employee.getTerminationDate() == null) {
				totalWorkingDays = totalWorkingDays + CommonModuleUtils.getWorkingDaysBetweenTwoDates(
						employee.getJoinDate(), endDate, timeConfigs, holidays, organizationTimeZone);
			}
			else if (employee.getJoinDate() != null && startDate.isAfter(employee.getJoinDate())
					&& employee.getTerminationDate() == null) {
				totalWorkingDays = totalWorkingDays + CommonModuleUtils.getWorkingDaysBetweenTwoDates(startDate,
						endDate, timeConfigs, holidays, organizationTimeZone);
			}
			else if (employee.getJoinDate() != null && startDate.isAfter(employee.getJoinDate())
					&& employee.getTerminationDate() != null && endDate.isAfter(employee.getTerminationDate())) {
				totalWorkingDays = totalWorkingDays + CommonModuleUtils.getWorkingDaysBetweenTwoDates(startDate,
						employee.getTerminationDate(), timeConfigs, holidays, organizationTimeZone);
			}
			else {
				totalWorkingDays = totalWorkingDays + CommonModuleUtils.getWorkingDaysBetweenTwoDates(startDate,
						endDate, timeConfigs, holidays, organizationTimeZone);
			}
		}
		return totalWorkingDays;
	}

	@Override
	public ResponseEntityDto getLeaveTrends(LeaveTrendFilterDto leaveTrendFilterDto) {
		LocalDate startDate = getStartDate(leaveTrendFilterDto);
		LocalDate endDate = getEndDate(leaveTrendFilterDto);

		validateStartAndEndDates(startDate, endDate);

		long allEmployeeCount = userDao.countByIsActive(true);
		List<Integer> workingDaysIndex = getWorkingDaysIndex();
		List<LocalDate> holidayDates = getHolidayDates();

		if (leaveTrendFilterDto.getTime().equals(LeaveTrendFilterDto.LeaveTrendFilterByTime.BY_DAY)) {
			return getLeaveTrendsByDay(leaveTrendFilterDto, allEmployeeCount, workingDaysIndex, holidayDates);
		}
		else {
			return getLeaveTrendsByMonth(leaveTrendFilterDto, startDate, endDate, allEmployeeCount, workingDaysIndex,
					holidayDates);
		}
	}

	private ResponseEntityDto getLeaveTrendsByDay(LeaveTrendFilterDto leaveTrendFilterDto, long allEmployeeCount,
			List<Integer> workingDaysIndex, List<LocalDate> holidayDates) {
		LocalDate trendByDayEndDate = DateTimeUtils.getCurrentUtcDate();
		LocalDate monthBefore = LeaveModuleUtil.getDateFromTheGivenBusinessDayCount(trendByDayEndDate, 30,
				workingDaysIndex, holidayDates);

		List<LeaveTrendByDay> leaveTrendByDays = leaveRequestDao.findLeaveTrendAwayByDay(monthBefore, trendByDayEndDate,
				workingDaysIndex, holidayDates);
		TreeMap<LocalDate, Integer> resultSet = new TreeMap<>();
		for (LeaveTrendByDay leaveTrendByDay : leaveTrendByDays) {
			resultSet.put(leaveTrendByDay.getLeaveDate(), leaveTrendByDay.getEmployeeCount());
		}

		monthBefore.datesUntil(trendByDayEndDate.plusDays(1))
			.filter(date -> workingDaysIndex.contains(date.getDayOfWeek().getValue() - 1)
					&& !holidayDates.contains(date))
			.forEach(date -> adjustResultSet(resultSet, date, leaveTrendFilterDto.getAvailability(), allEmployeeCount));

		return new ResponseEntityDto(false, resultSet);
	}

	private void adjustResultSet(TreeMap<LocalDate, Integer> resultSet, LocalDate date,
			LeaveTrendFilterDto.LeaveTrendFilterByAvailability availability, long allEmployeeCount) {
		if (availability.equals(LeaveTrendFilterDto.LeaveTrendFilterByAvailability.ONLINE)) {
			resultSet.merge(date, (int) allEmployeeCount, (a, b) -> (b - a));
		}
		else {
			resultSet.putIfAbsent(date, 0);
		}
	}

	private ResponseEntityDto getLeaveTrendsByMonth(LeaveTrendFilterDto leaveTrendFilterDto, LocalDate startDate,
			LocalDate endDate, long allEmployeeCount, List<Integer> workingDaysIndex, List<LocalDate> holidayDates) {
		HashMap<Integer, Integer> resultSet = getMonthlyLeaveTrends(startDate, endDate, workingDaysIndex, holidayDates);
		processDataBasedOnOnlineAndAway(startDate, endDate, allEmployeeCount, leaveTrendFilterDto, resultSet);

		LinkedHashMap<String, Integer> finalResultSet = formatMonthlyResultSet(leaveTrendFilterDto, startDate,
				resultSet);

		return new ResponseEntityDto(false, finalResultSet);
	}

	private LinkedHashMap<String, Integer> formatMonthlyResultSet(LeaveTrendFilterDto leaveTrendFilterDto,
			LocalDate startDate, HashMap<Integer, Integer> resultSet) {
		LinkedHashMap<String, Integer> finalResultSet = new LinkedHashMap<>();
		int startMonth = getStartMonth(leaveTrendFilterDto, startDate);

		for (int month = startMonth; month <= startMonth + 12; month++) {
			int monthIndex = month > 12 ? month - 12 : month;
			finalResultSet.put(
					PeopleUtil.makeFirstLetterUpper(Month.of(monthIndex).name().substring(0, 3).toLowerCase()),
					resultSet.get(monthIndex));
		}

		return finalResultSet;
	}

	private void processDataBasedOnOnlineAndAway(LocalDate startDate, LocalDate endDate, long allEmployeeCount,
			LeaveTrendFilterDto leaveTrendFilterDto, HashMap<Integer, Integer> resultSet) {
		long totalCount;
		int weekDayCount;
		int month = startDate.getMonthValue();
		int numberOfMonths = LeaveModuleUtil.getNumberOfMonthsBetweenTwoDates(startDate, endDate);

		while (month <= numberOfMonths + startDate.getMonthValue()) {
			int monthIndex = month > 12 ? month - 12 : month;
			weekDayCount = getWeekDayCount(monthIndex);
			totalCount = weekDayCount * allEmployeeCount;
			if (leaveTrendFilterDto.getAvailability()
				.equals(LeaveTrendFilterDto.LeaveTrendFilterByAvailability.ONLINE)) {
				resultSet.merge(monthIndex, (int) totalCount, (a, b) -> (b - a));
			}
			else {
				resultSet.putIfAbsent(monthIndex, 0);
			}
			month++;
		}
	}

	private int getWeekDayCount(int month) {
		Calendar instance = Calendar.getInstance();
		int year = instance.get(Calendar.YEAR);
		LocalDate startDate = LocalDate.of(year, month, 1);
		LocalDate endDate = startDate.withDayOfMonth(startDate.getMonth().length(startDate.isLeapYear()));
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<LocalDate> holidays = holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();
		return CommonModuleUtils.getWorkingDaysBetweenTwoDates(startDate, endDate, timeConfigs, holidays,
				organizationService.getOrganizationTimeZone());
	}

	private HashMap<Integer, Integer> getMonthlyLeaveTrends(LocalDate startDate, LocalDate endDate,
			List<Integer> workingDaysIndex, List<LocalDate> holidayDates) {
		List<LeaveTrendByMonth> leaveTrendByMonths = leaveRequestDao.findLeaveTrendAwayByMonth(startDate, endDate,
				workingDaysIndex, holidayDates);
		HashMap<Integer, Integer> resultSet = new LinkedHashMap<>();
		for (LeaveTrendByMonth leaveTrendByMonth : leaveTrendByMonths) {
			resultSet.put(leaveTrendByMonth.getKeyValue(), leaveTrendByMonth.getEmployeeCount());
		}
		return resultSet;
	}

	@Override
	public ResponseEntityDto getLeaveTypeBreakdown(List<Long> typeIds, List<Long> teamIds) {
		if (typeIds == null || typeIds.isEmpty()) {
			typeIds = new ArrayList<>();
			typeIds.add(-1L);
		}

		if (teamIds == null || teamIds.isEmpty()) {
			teamIds = new ArrayList<>();
			teamIds.add(-1L);
		}

		User currentUser = userService.getCurrentUser();
		List<LeaveType> leaveTypes = typeIds.contains(-1L) ? leaveTypeDao.findAllByIsActive(true)
				: leaveTypeDao.findByTypeIdInAndIsActive(typeIds, true);

		List<LocalDate> holidayDates = holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();

		List<Team> teams = teamDao.findByTeamIdIn(teamIds);
		LeaveModuleUtil.validateTeamsForLeaveAnalytics(teamIds, currentUser, teams);

		LeaveCycleDetailsDto leaveCycleDetail = leaveCycleService.getLeaveCycleConfigs();

		int cycleEndYear = LeaveModuleUtil.getLeaveCycleEndYear(leaveCycleDetail.getStartMonth(),
				leaveCycleDetail.getStartDate());
		LocalDate startDate = LocalDate.of(leaveCycleDetail.getStartMonth() == 1 && leaveCycleDetail.getStartDate() == 1
				? cycleEndYear : cycleEndYear - 1, leaveCycleDetail.getStartMonth(), leaveCycleDetail.getStartDate());
		LocalDate endDate = LocalDate.of(cycleEndYear, leaveCycleDetail.getEndMonth(), leaveCycleDetail.getEndDate());

		var list = leaveRequestDao.findLeaveTypeBreakDown(getWorkingDaysIndex(), holidayDates, startDate, endDate,
				typeIds.contains(-1L) ? null : typeIds, teamIds.contains(-1L) ? null : teamIds);
		Map<Integer, Double> totalLeavesWithMonths = list.stream()
			.collect(Collectors.groupingBy(LeaveTypeBreakDown::getKeyValue,
					Collectors.summingDouble(LeaveTypeBreakDown::getLeaveCount)));
		Map<String, Float> totalLeaveTypeBreakdownWithMonthsResultsSet = mapMonthKeysToName(startDate, endDate,
				totalLeavesWithMonths);

		Map<Integer, Map<Integer, Double>> result = list.stream()
			.collect(Collectors.groupingBy(LeaveTypeBreakDown::getLeaveType, Collectors.groupingBy(
					LeaveTypeBreakDown::getKeyValue, Collectors.summingDouble(LeaveTypeBreakDown::getLeaveCount))));

		LeaveUtilizationResponseDto response = getLeaveUtilizationDataResponseDto(leaveTypes, result,
				totalLeaveTypeBreakdownWithMonthsResultsSet, startDate, endDate);

		return new ResponseEntityDto(false, response);
	}

	private LeaveUtilizationResponseDto getLeaveUtilizationDataResponseDto(List<LeaveType> leaveTypes,
			Map<Integer, Map<Integer, Double>> totalLeavesWithMonthLeaveType,
			Map<String, Float> totalLeavesWithMonthsResultsSet, LocalDate startDate, LocalDate endDate) {
		List<LeaveUtilizationDataResponseDto> leaveUtilizationDataResponseDtos = new ArrayList<>();
		for (LeaveType leaveType : leaveTypes) {
			LeaveUtilizationDataResponseDto leaveUtilizationDataResponseDto = new LeaveUtilizationDataResponseDto();
			leaveUtilizationDataResponseDto.setLeaveType(leaveMapper.leaveTypeToLeaveTypeBasicInfoDto(leaveType));
			Map<Integer, Double> countByMonth = totalLeavesWithMonthLeaveType.get(leaveType.getTypeId().intValue());
			Map<String, Float> resultSet = mapMonthKeysToName(startDate, endDate, countByMonth);

			leaveUtilizationDataResponseDto.setLeaveUtilizationData(resultSet);
			leaveUtilizationDataResponseDtos.add(leaveUtilizationDataResponseDto);
		}

		LeaveUtilizationResponseDto leaveUtilizationResponseDto = new LeaveUtilizationResponseDto();
		leaveUtilizationResponseDto.setTotalLeavesWithType(leaveUtilizationDataResponseDtos);
		leaveUtilizationResponseDto.setTotalLeaves(totalLeavesWithMonthsResultsSet);
		return leaveUtilizationResponseDto;
	}

	@Override
	public ResponseEntityDto getEmployeesOnLeave(EmployeesOnLeaveFilterDto employeesOnLeaveFilterDto) {
		log.info("getEmployeesOnLeave: execution started");

		List<DayOfWeek> workingDays = timeConfigDao.findAll().stream().map(TimeConfig::getDay).toList();
		DayOfWeek checkingDay = employeesOnLeaveFilterDto.getDate().getDayOfWeek();

		List<Holiday> holidayList = holidayDao.findAllByIsActiveTrueAndDate(employeesOnLeaveFilterDto.getDate());
		boolean isNotWorkingDay = !workingDays.contains(checkingDay);

		if (isNotWorkingDay || !holidayList.isEmpty()) {
			List<HolidayResponseDto> holidayResponseDtos = new ArrayList<>();

			if (!holidayList.isEmpty()) {
				holidayResponseDtos.addAll(leaveMapper.holidaysToHolidayResponseDtoList(holidayList));
			}

			if (isNotWorkingDay) {
				HolidayResponseDto holiday = new HolidayResponseDto();
				holiday.setDate(employeesOnLeaveFilterDto.getDate());
				holiday.setName("Day Off!");
				holidayResponseDtos.add(holiday);
			}

			log.info("getEmployeesOnLeave: Returning non-working day or holiday information");
			return new ResponseEntityDto(false, new AdminEmployeesOnLeaveDto(null, true, holidayResponseDtos));
		}

		User currentUser = userService.getCurrentUser();
		EmployeeRole employeeRole = currentUser.getEmployee().getEmployeeRole();
		boolean isLeaveAdmin = employeeRole.getLeaveRole() != null
				&& employeeRole.getLeaveRole().equals(Role.LEAVE_ADMIN);
		AdminOnLeaveDto adminOnLeaveDto = employeeDao.findAllEmployeesOnLeave(employeesOnLeaveFilterDto,
				currentUser.getUserId(), isLeaveAdmin);
		log.info("getEmployeesOnLeave: Successfully returned all employees on leave");
		return new ResponseEntityDto(false, new AdminEmployeesOnLeaveDto(adminOnLeaveDto, false, null));
	}

	private LocalDate getStartDate(LeaveTrendFilterDto leaveTrendFilterDto) {
		if (leaveTrendFilterDto.getStartDate() != null) {
			return leaveTrendFilterDto.getStartDate();
		}
		LeaveCycleDetailsDto leaveCycleDetail = leaveCycleService.getLeaveCycleConfigs();
		int cycleEndYear = LeaveModuleUtil.getLeaveCycleEndYear(leaveCycleDetail.getStartMonth() - 1,
				leaveCycleDetail.getStartDate());
		return LocalDate.of(leaveCycleDetail.getStartMonth() == 1 && leaveCycleDetail.getStartDate() == 1 ? cycleEndYear
				: cycleEndYear - 1, leaveCycleDetail.getStartMonth(), leaveCycleDetail.getStartDate());
	}

	private LocalDate getEndDate(LeaveTrendFilterDto leaveTrendFilterDto) {
		if (leaveTrendFilterDto.getEndDate() != null) {
			return leaveTrendFilterDto.getEndDate();
		}
		LeaveCycleDetailsDto leaveCycleDetail = leaveCycleService.getLeaveCycleConfigs();
		int cycleEndYear = LeaveModuleUtil.getLeaveCycleEndYear(leaveCycleDetail.getStartMonth() - 1,
				leaveCycleDetail.getStartDate());
		return LocalDate.of(cycleEndYear, leaveCycleDetail.getEndMonth(), leaveCycleDetail.getEndDate());
	}

	private void validateStartAndEndDates(LocalDate startDate, LocalDate endDate) {
		if (startDate.getYear() < DateTimeUtils.getCurrentYear() - 1
				|| endDate.getYear() <= DateTimeUtils.getCurrentYear() - 1 || startDate.isAfter(endDate)
				|| endDate.isBefore(startDate)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_START_DATE_END_DATE_NOT_VALID);
		}
	}

	private List<LocalDate> getHolidayDates() {
		return holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();
	}

	private List<Integer> getWorkingDaysIndex() {
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		return timeConfigs.stream().map(TimeConfig::getDay).map(day -> day.getValue() % 7).toList();
	}

	private int getStartMonth(LeaveTrendFilterDto leaveTrendFilterDto, LocalDate startDate) {
		if (leaveTrendFilterDto.getStartDate() == null || leaveTrendFilterDto.getEndDate() == null) {
			LeaveCycleDetailsDto leaveCycleDetail = leaveCycleService.getLeaveCycleConfigs();
			return leaveCycleDetail.getStartMonth();
		}
		else {
			return startDate.getMonthValue();
		}
	}

	/**
	 * Checks whether the current user is a manager of the passed employee entity
	 * @param currentUser logged user who requested the method
	 * @param employee employee entity user requested the analytics of
	 * @param requestedAnalytics requested analytics
	 */
	private void isEmployeeUnderCurrentUserSupervision(User currentUser, Employee employee, String requestedAnalytics) {
		String currentUserRole = currentUser.getEmployee().getEmployeeRole().getLeaveRole().toString();
		if (currentUserRole.equalsIgnoreCase("MANAGERS")) {
			// filter the list of manager the employee has to check whether the current
			// user is one of the managers

			List<EmployeeManager> managers = employee.getEmployeeManagers()
				.stream()
				.filter(employeeManager -> employeeManager.getManager()
					.getEmployeeId()
					.equals(currentUser.getEmployee().getEmployeeId()))
				.toList();

			if (managers.isEmpty()) {
				throw new EntityNotFoundException(
						PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_UNDER_CURRENT_EMPLOYEE_SUPERVISION,
						new String[] { "Employee", requestedAnalytics });
			}
		}
	}

	/**
	 * Checks whether the current user is the lead of the passed team entity
	 * @param currentUser logged user who requested the method
	 * @param team team entity user requested the analytics of
	 * @param requestedAnalytics requested analytics
	 */
	private void isTeamUnderCurrentUserSupervision(User currentUser, Team team, String requestedAnalytics) {
		String currentUserRole = currentUser.getEmployee().getEmployeeRole().getLeaveRole().toString();
		if (currentUserRole.equalsIgnoreCase("MANAGERS") && team.getEmployees()
			.stream()
			.filter(EmployeeTeam::getIsSupervisor)
			.map(employeeTeam -> employeeTeam.getEmployee()
				.getEmployeeId()
				.equals(currentUser.getEmployee().getEmployeeId()))
			.toList()
			.isEmpty()) {
			throw new EntityNotFoundException(
					PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_UNDER_CURRENT_EMPLOYEE_SUPERVISION,
					new String[] { "Team", requestedAnalytics });
		}
	}

	@Override
	public ResponseEntityDto getEmployeeLeaveUtilization(LeaveUtilizationFilterDto leaveUtilizationFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("getLeaveUtilization: execution started by user: {}", currentUser.getUserId());

		Year leaveCycleYear = Year.now();
		LeaveCycleDetailsDto leaveCycleDetail = leaveCycleService.getLeaveCycleConfigs();
		if (leaveCycleDetail == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_CYCLE_NOT_FOUND);
		}

		if (leaveCycleDetail.getStartMonth() != 1 || leaveCycleDetail.getStartDate() != 1) {
			leaveCycleYear = leaveCycleYear.plusYears(1);
		}

		LocalDate cycleStartDate = LocalDate.of(leaveCycleYear.getValue(), leaveCycleDetail.getStartMonth(),
				leaveCycleDetail.getStartDate());

		LocalDate cycleEndDate = LocalDate.of(leaveCycleYear.getValue(), leaveCycleDetail.getEndMonth(),
				leaveCycleDetail.getEndDate());

		leaveUtilizationFilterDto.setStartDate(cycleStartDate);
		leaveUtilizationFilterDto.setEndDate(cycleEndDate);

		Long employeeId = leaveUtilizationFilterDto.getEmployeeId();
		Optional<Employee> employeeOptional = employeeDao.findByEmployeeId(employeeId);
		List<Long> leaveTypeIds = leaveUtilizationFilterDto.getLeaveTypeIds();
		List<LeaveType> leaveTypes = getLeaveTypes(leaveUtilizationFilterDto.getLeaveTypeIds());
		if (leaveTypeIds.getFirst() == -1) {
			leaveTypeIds = leaveTypes.stream().map(LeaveType::getTypeId).toList();
		}

		if (employeeOptional.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND);
		}
		isEmployeeUnderCurrentUserSupervision(currentUser, employeeOptional.get(), "Leave Utilization");

		LocalDate[] dateRange = new LocalDate[2];

		setStartAndEndDate(dateRange, leaveUtilizationFilterDto.getStartDate(), leaveUtilizationFilterDto.getEndDate());

		LocalDate startDate = dateRange[0];
		LocalDate endDate = dateRange[1];

		if (invalidStartAndEndDate(startDate, endDate)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_START_DATE_END_DATE_NOT_VALID);
		}

		List<LocalDate> holidayDates = holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<LeaveUtilizationByEmployeeMonthly> leaveUtilizationByEmployeeMonthly = leaveRequestDao
			.findLeaveUtilizationByEmployeeMonthly(startDate, endDate,
					CommonModuleUtils.getWorkingDaysIndex(timeConfigs), holidayDates, employeeId, leaveTypeIds);

		Map<Integer, Double> totalLeavesWithMonths = leaveUtilizationByEmployeeMonthly.stream()
			.collect(Collectors.groupingBy(LeaveUtilizationByEmployeeMonthly::getMonthValue,
					Collectors.summingDouble(LeaveUtilizationByEmployeeMonthly::getLeaveCount)));

		Map<String, Float> totalLeavesWithMonthsResultsSet = mapMonthKeysToName(startDate, endDate,
				totalLeavesWithMonths);

		Map<Integer, Map<Integer, Double>> result = leaveUtilizationByEmployeeMonthly.stream()
			.collect(Collectors.groupingBy(LeaveUtilizationByEmployeeMonthly::getLeaveType,
					Collectors.groupingBy(LeaveUtilizationByEmployeeMonthly::getMonthValue,
							Collectors.summingDouble(LeaveUtilizationByEmployeeMonthly::getLeaveCount))));

		LeaveUtilizationResponseDto response = getLeaveUtilizationDataResponseDto(leaveTypes, result,
				totalLeavesWithMonthsResultsSet, startDate, endDate);

		log.info("getLeaveUtilization: execution ended successfully");
		return new ResponseEntityDto(false, response);
	}

	@Override
	public ResponseEntityDto getOrganizationLeaveTrendForTheYear(
			OrganizationLeaveTrendForTheYearFilterDto organizationLeaveTrendForTheYearFilterDto) {
		log.info("getOrganizationLeaveTrendsForTheYear: execution started");

		LocalDate[] dateRange = new LocalDate[2];

		setStartAndEndDate(dateRange, organizationLeaveTrendForTheYearFilterDto.getStartDate(),
				organizationLeaveTrendForTheYearFilterDto.getEndDate());

		LocalDate startDate = dateRange[0];
		LocalDate endDate = dateRange[1];

		if (invalidStartAndEndDate(startDate, endDate)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_START_DATE_END_DATE_NOT_VALID);
		}

		List<Long> leaveTypeIds = organizationLeaveTrendForTheYearFilterDto.getLeaveTypeIds();
		List<LeaveType> leaveTypes = getLeaveTypes(organizationLeaveTrendForTheYearFilterDto.getLeaveTypeIds());
		if (leaveTypeIds.getFirst() == -1) {
			leaveTypeIds = leaveTypes.stream().map(LeaveType::getTypeId).toList();
		}

		List<LocalDate> holidayDates = holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<Integer> workingDays = CommonModuleUtils.getWorkingDaysIndex(timeConfigs);

		List<OrganizationLeaveTrendForTheYear> organizationLeaveTrendForTheYears = leaveRequestDao
			.findOrganizationLeaveTrendForTheYear(workingDays, holidayDates, leaveTypeIds, startDate, endDate);

		Map<Integer, Double> totalLeavesWithMonths = organizationLeaveTrendForTheYears.stream()
			.collect(Collectors.groupingBy(OrganizationLeaveTrendForTheYear::getKeyValue,
					Collectors.summingDouble(OrganizationLeaveTrendForTheYear::getLeaveRequestCount)));

		Map<String, Float> totalLeavesWithMonthsResultsSet = mapMonthKeysToName(startDate, endDate,
				totalLeavesWithMonths);

		Map<Integer, Map<Integer, Double>> totalLeavesWithMonthLeaveType = organizationLeaveTrendForTheYears.stream()
			.collect(Collectors.groupingBy(OrganizationLeaveTrendForTheYear::getLeaveType,
					Collectors.groupingBy(OrganizationLeaveTrendForTheYear::getKeyValue,
							Collectors.summingDouble(OrganizationLeaveTrendForTheYear::getLeaveRequestCount))));

		LeaveTrendResponseDto responseDto = getLeaveTrendForTheYearResponseDto(leaveTypes,
				totalLeavesWithMonthLeaveType, totalLeavesWithMonthsResultsSet, startDate, endDate);

		log.info("getOrganizationLeaveTrendsForTheYear: execution ended successfully");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto getTeamLeaveTrendForTheYear(
			TeamLeaveTrendForTheYearFilterDto teamLeaveTrendForTheYearFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("getTeamLeaveTrendForTheYear: execution started");

		Long teamId = teamLeaveTrendForTheYearFilterDto.getTeamId();
		Optional<Team> team = teamDao.findByTeamIdAndIsActive(teamId, true);
		if (team.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND);
		}
		isTeamUnderCurrentUserSupervision(currentUser, team.get(), "Leave Trend");

		List<Long> leaveTypeIds = teamLeaveTrendForTheYearFilterDto.getLeaveTypeIds();
		List<LeaveType> leaveTypes = getLeaveTypes(teamLeaveTrendForTheYearFilterDto.getLeaveTypeIds());
		if (leaveTypeIds.getFirst() == -1) {
			leaveTypeIds = leaveTypes.stream().map(LeaveType::getTypeId).toList();
		}

		LocalDate[] dateRange = new LocalDate[2];

		setStartAndEndDate(dateRange, teamLeaveTrendForTheYearFilterDto.getStartDate(),
				teamLeaveTrendForTheYearFilterDto.getEndDate());

		LocalDate startDate = dateRange[0];
		LocalDate endDate = dateRange[1];

		if (invalidStartAndEndDate(startDate, endDate)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_START_DATE_END_DATE_NOT_VALID);
		}

		List<LocalDate> holidayDates = holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<Integer> workingDays = CommonModuleUtils.getWorkingDaysIndex(timeConfigs);

		List<TeamLeaveTrendForTheYear> teamLeaveTrendForTheYears = leaveRequestDao.findTeamLeaveTrendForTheYear(teamId,
				workingDays, holidayDates, leaveTypeIds, startDate, endDate);

		Map<Integer, Double> totalLeavesWithMonths = teamLeaveTrendForTheYears.stream()
			.collect(Collectors.groupingBy(TeamLeaveTrendForTheYear::getKeyValue,
					Collectors.summingDouble((TeamLeaveTrendForTheYear::getLeaveRequestCount))));

		Map<String, Float> totalLeavesWithMonthsResultsSet = mapMonthKeysToName(startDate, endDate,
				totalLeavesWithMonths);

		Map<Integer, Map<Integer, Double>> totalLeavesWithMonthLeaveType = teamLeaveTrendForTheYears.stream()
			.collect(Collectors.groupingBy(TeamLeaveTrendForTheYear::getLeaveType,
					Collectors.groupingBy(TeamLeaveTrendForTheYear::getKeyValue,
							Collectors.summingDouble(TeamLeaveTrendForTheYear::getLeaveRequestCount))));

		LeaveTrendResponseDto responseDto = getLeaveTrendForTheYearResponseDto(leaveTypes,
				totalLeavesWithMonthLeaveType, totalLeavesWithMonthsResultsSet, startDate, endDate);
		return new ResponseEntityDto(false, responseDto);
	}

	/**
	 * Retrieves the leave trend for a specific manager. This includes the monthly count
	 * of approved and pending leave requests. The data covers employees directly assigned
	 * to the manager and team members under the manager's leadership. The trend is
	 * calculated based on the specified leave types and date range.
	 * @param managerLeaveTrendFilterDto a filter DTO containing leave type IDs, start
	 * date, and end date.
	 * @return ResponseEntityDto containing the leave trend data.
	 */
	@Override
	public ResponseEntityDto getManagerLeaveTrend(ManagerLeaveTrendFilterDto managerLeaveTrendFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("getManagerLeaveTrend: execution started for the user: {}", currentUser.getUserId());

		List<Long> leadingTeamsIds = teamDao.findLeadingTeamIdsByManagerId(currentUser.getEmployee().getEmployeeId());
		List<Long> employeeIds = employeeDao.findEmployeeIdsByManagerId(currentUser.getEmployee().getEmployeeId());

		List<Long> leaveTypeIds = managerLeaveTrendFilterDto.getLeaveTypeIds();
		List<LeaveType> leaveTypes = getLeaveTypes(managerLeaveTrendFilterDto.getLeaveTypeIds());
		if (leaveTypeIds.getFirst() == -1) {

			leaveTypeIds = leaveTypes.stream().map(LeaveType::getTypeId).toList();
		}

		LocalDate[] dateRange = new LocalDate[2];

		setStartAndEndDate(dateRange, managerLeaveTrendFilterDto.getStartDate(),
				managerLeaveTrendFilterDto.getEndDate());

		LocalDate startDate = dateRange[0];
		LocalDate endDate = dateRange[1];

		if (invalidStartAndEndDate(startDate, endDate)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_START_DATE_END_DATE_NOT_VALID);
		}

		List<LocalDate> holidayDates = holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<Integer> workingDays = CommonModuleUtils.getWorkingDaysIndex(timeConfigs);
		List<ManagerLeaveTrend> managerLeaveTrendForTheYears = leaveRequestDao.findLeaveTrendForTheManager(
				leadingTeamsIds, workingDays, holidayDates, leaveTypeIds, startDate, endDate, employeeIds);

		Map<Integer, Double> totalLeavesWithMonths = managerLeaveTrendForTheYears.stream()
			.collect(Collectors.groupingBy(ManagerLeaveTrend::getKeyValue,
					Collectors.summingDouble((ManagerLeaveTrend::getLeaveRequestCount))));

		Map<String, Float> totalLeavesWithMonthsResultsSet = mapMonthKeysToName(startDate, endDate,
				totalLeavesWithMonths);

		Map<Integer, Map<Integer, Double>> totalLeavesWithMonthLeaveType = managerLeaveTrendForTheYears.stream()
			.collect(Collectors.groupingBy(ManagerLeaveTrend::getLeaveType,
					Collectors.groupingBy(ManagerLeaveTrend::getKeyValue,
							Collectors.summingDouble(ManagerLeaveTrend::getLeaveRequestCount))));

		LeaveTrendResponseDto responseDto = getLeaveTrendForTheYearResponseDto(leaveTypes,
				totalLeavesWithMonthLeaveType, totalLeavesWithMonthsResultsSet, startDate, endDate);
		log.info("getManagerLeaveTrend: execution ended for the user: {}", currentUser.getUserId());
		return new ResponseEntityDto(false, responseDto);
	}

	private List<LeaveType> getLeaveTypes(List<Long> leaveTypeIds) {
		List<LeaveType> leaveTypes;
		if (leaveTypeIds.getFirst() == -1) {
			leaveTypes = leaveTypeDao.findAll();
		}
		else {
			leaveTypes = leaveTypeDao.findAllById(leaveTypeIds);
			if (leaveTypeIds.size() != leaveTypes.size()) {
				throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_TYPE_NOT_FOUND);
			}
		}
		return leaveTypes;
	}

	private LeaveTrendResponseDto getLeaveTrendForTheYearResponseDto(List<LeaveType> leaveTypes,
			Map<Integer, Map<Integer, Double>> totalLeavesWithMonthLeaveType,
			Map<String, Float> totalLeavesWithMonthsResultsSet, LocalDate startDate, LocalDate endDate) {
		List<LeaveTrendDataResponseDto> leaveTrendDataResponseDtos = new ArrayList<>();
		for (LeaveType leaveType : leaveTypes) {
			LeaveTrendDataResponseDto leaveTrendDataResponseDto = new LeaveTrendDataResponseDto();
			leaveTrendDataResponseDto.setLeaveType(leaveMapper.leaveTypeToLeaveTypeBasicInfoDto(leaveType));
			Map<Integer, Double> countByMonth = totalLeavesWithMonthLeaveType.get(leaveType.getTypeId().intValue());
			Map<String, Float> resultSet = mapMonthKeysToName(startDate, endDate, countByMonth);
			leaveTrendDataResponseDto.setLeaveTrendData(resultSet);
			leaveTrendDataResponseDtos.add(leaveTrendDataResponseDto);
		}

		LeaveTrendResponseDto leaveTrendResponseDto = new LeaveTrendResponseDto();
		leaveTrendResponseDto.setTotalLeavesWithType(leaveTrendDataResponseDtos);
		leaveTrendResponseDto.setTotalLeaves(totalLeavesWithMonthsResultsSet);
		return leaveTrendResponseDto;
	}

	@Override
	public ResponseEntityDto getTeamResourceAvailability(
			ManagerTeamResourceAvailabilityDto managerTeamResourceAvailabilityDto) {
		log.info("getTeamResourceAvailability: execution started");

		User currentUser = userService.getCurrentUser();

		LocalDate[] dateRange = new LocalDate[2];

		LocalDate[] resourceAvailabilityDtoDates = new LocalDate[2];

		if (managerTeamResourceAvailabilityDto.getStartDate() != null
				&& managerTeamResourceAvailabilityDto.getEndDate() != null) {
			resourceAvailabilityDtoDates[0] = managerTeamResourceAvailabilityDto.getStartDate();
			resourceAvailabilityDtoDates[1] = managerTeamResourceAvailabilityDto.getEndDate();
		}

		setStartAndEndDate(dateRange, resourceAvailabilityDtoDates[0], resourceAvailabilityDtoDates[1]);

		LocalDate startDate = dateRange[0];
		LocalDate endDate = dateRange[1];

		if (managerTeamResourceAvailabilityDto.getStartDate() == null
				|| managerTeamResourceAvailabilityDto.getEndDate() == null) {
			managerTeamResourceAvailabilityDto.setStartDate(startDate);
			managerTeamResourceAvailabilityDto.setEndDate(endDate);
		}

		if (DateTimeUtils.getYear(startDate) < DateTimeUtils.getCurrentYear() - 1
				|| DateTimeUtils.getYear(endDate) < DateTimeUtils.getCurrentYear() - 1 || startDate.isAfter(endDate)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_START_DATE_END_DATE_NOT_VALID);
		}
		List<Long> teamsIds = managerTeamResourceAvailabilityDto.getTeamIds();
		List<Long> leadTeamIds;
		if (teamsIds == null || teamsIds.isEmpty()) {
			teamsIds = teamDao.findLeadingTeamIdsByManagerId(currentUser.getUserId());
		}
		else {
			leadTeamIds = teamDao.findLeadingTeamIdsByManagerId(currentUser.getUserId());
			for (Long teamId : teamsIds) {
				if (!leadTeamIds.contains(teamId)) {
					throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_SUPERVISOR_IDS_NOT_VALID);
				}
			}
		}

		EmployeesOnLeavePeriodFilterDto employeesOnLeavePeriodFilterDto = new EmployeesOnLeavePeriodFilterDto();
		employeesOnLeavePeriodFilterDto.setStartDate(startDate);
		employeesOnLeavePeriodFilterDto.setEndDate(endDate);
		employeesOnLeavePeriodFilterDto.setTeamIds(managerTeamResourceAvailabilityDto.getTeamIds());
		List<LeaveRequest> leaveRequests = leaveRequestDao.getLeaveRequestsByTeamId(employeesOnLeavePeriodFilterDto);

		List<TeamResourceAvailabilityResponseDto> teamResourceAvailabilityResponseDtos = createTeamResourceAvailabilityResponseDToByDay(
				managerTeamResourceAvailabilityDto);
		List<Holiday> holidays = holidayDao.findAllByIsActiveTrueAndDateBetween(startDate, endDate);

		for (TeamResourceAvailabilityResponseDto teamResourceResponseDto : teamResourceAvailabilityResponseDtos) {
			List<Holiday> holidayList = holidays.stream()
				.filter(holiday -> holiday.getDate() != null
						&& holiday.getDate().isEqual(teamResourceResponseDto.getDate()))
				.toList();

			setTeamResourceAvailabilityResponseDtos(holidayList, leaveRequests, teamsIds, teamResourceResponseDto);
		}

		log.info("getTeamResourceAvailability: execution ended successfully");
		return new ResponseEntityDto(false, teamResourceAvailabilityResponseDtos);
	}

	@Override
	public ResponseEntityDto getOrganizationalLeaveAnalytics() {

		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();
		LeaveCycleDetailsDto leaveCycleDetail = leaveCycleService.getLeaveCycleConfigs();

		int cycleEndYear = LeaveModuleUtil.getLeaveCycleEndYear(leaveCycleDetail.getStartMonth() - 1,
				leaveCycleDetail.getStartDate());
		LocalDate firstDateOfYear = LocalDate
			.of(leaveCycleDetail.getStartMonth() == 1 && leaveCycleDetail.getStartDate() == 1 ? cycleEndYear
					: cycleEndYear - 1, leaveCycleDetail.getStartMonth(), leaveCycleDetail.getStartDate());
		LocalDate lastDateOfYear = LocalDate.of(cycleEndYear, leaveCycleDetail.getEndMonth(),
				leaveCycleDetail.getEndDate());

		LocalDate twoMonthsBackLastDay = currentDate.minusMonths(2).with(lastDayOfMonth());
		LocalDate lastMonthFirstDay = currentDate.minusMonths(1).with(firstDayOfMonth());
		LocalDate lastMonthLastDay = currentDate.minusMonths(1).with(lastDayOfMonth());

		/*
		 * Getting the no of working days
		 */
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<LocalDate> holidayDates = holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();

		Long employeeCounts = employeeDao.findAllActiveEmployeesCount();

		/*
		 * absence rate annually x = employee leave request (start of the year to 2 months
		 * back) / (working days between start of the year to 2 months back from current
		 * month * total active employee count) y = (x / count of months between start of
		 * the year to 2 months back from current month) * 100 y => average absence rate
		 * as percentage
		 */

		String organizationTimeZone = organizationService.getOrganizationTimeZone();
		int numOfWorkingDaysForTwoMonthsBack = CommonModuleUtils.getWorkingDaysBetweenTwoDates(firstDateOfYear,
				twoMonthsBackLastDay, timeConfigs, holidayDates, organizationTimeZone);
		int numOfWorkingDaysForCurrentDate = CommonModuleUtils.getWorkingDaysBetweenTwoDates(firstDateOfYear,
				currentDate, timeConfigs, holidayDates, organizationTimeZone);

		float absenceRateForCurrentDate = getAbsenceRateForCurrentDate(firstDateOfYear, currentDate,
				numOfWorkingDaysForCurrentDate, timeConfigs, holidayDates, employeeCounts);
		float absenceRateForTwoMonthsBack = getAbsenceRateForTwoMonthsBack(firstDateOfYear, twoMonthsBackLastDay,
				numOfWorkingDaysForTwoMonthsBack, employeeCounts, timeConfigs, holidayDates);

		/*
		 * absence rate of last month = last month leave count / (working days for last
		 * month * total employee count) * 100 month on month absence rate = absence rate
		 * of last month - y
		 */
		float monthOnMonthAbsenceRate = getMonthOnMonthAbsenceRate(lastMonthFirstDay, lastMonthLastDay, employeeCounts,
				absenceRateForTwoMonthsBack, timeConfigs, holidayDates);

		List<OrganizationalLeaveAnalyticsKPIDto> leaveAbsenceVacationAnalyticsDtoList = new ArrayList<>();

		OrganizationalLeaveAnalyticsKPIDto leaveAbsenceVacationAnalyticsDtoAnnually = new OrganizationalLeaveAnalyticsKPIDto(
				OrganizationalLeaveAnalyticsKPIAbsenceType.CURRENT_ABSENCE_RATE, absenceRateForCurrentDate,
				firstDateOfYear + " - " + currentDate);
		leaveAbsenceVacationAnalyticsDtoList.add(leaveAbsenceVacationAnalyticsDtoAnnually);

		OrganizationalLeaveAnalyticsKPIDto leaveAbsenceVacationAnalyticsDtoLastMonth = new OrganizationalLeaveAnalyticsKPIDto(
				OrganizationalLeaveAnalyticsKPIAbsenceType.MONTH_ON_MONTH_ABSENCE_RATE, monthOnMonthAbsenceRate,
				lastMonthFirstDay + " - " + lastMonthLastDay);
		leaveAbsenceVacationAnalyticsDtoList.add(leaveAbsenceVacationAnalyticsDtoLastMonth);

		// KPI 1
		LeaveAnalyticsFilterDto leaveAnalyticsFilterResponseDto = new LeaveAnalyticsFilterDto();
		leaveAnalyticsFilterResponseDto.setAnalyticsType(OrganizationalLeaveAnalyticsKPIType.ABSENCE_RATE);
		leaveAnalyticsFilterResponseDto.setOrganizationalLeaveAnalyticsDto(leaveAbsenceVacationAnalyticsDtoList);

		// vacation usage rate = total number of annuals taken / total annuals given
		float vacationUsageRate = getAnnualVacationUsageRate(firstDateOfYear, lastDateOfYear, currentDate);

		// KPI 2
		List<OrganizationalLeaveAnalyticsKPIDto> leaveAbsenceVacationAnalyticsDtoList2 = new ArrayList<>();

		OrganizationalLeaveAnalyticsKPIDto leaveAbsenceVacationAnalyticsDtoAnnually2 = new OrganizationalLeaveAnalyticsKPIDto(
				OrganizationalLeaveAnalyticsKPIAbsenceType.CURRENT_LEAVE_USAGE_RATE, vacationUsageRate,
				firstDateOfYear + " - " + currentDate);
		leaveAbsenceVacationAnalyticsDtoList2.add(leaveAbsenceVacationAnalyticsDtoAnnually2);

		LeaveAnalyticsFilterDto leaveAnalyticsFilterResponseDto2 = new LeaveAnalyticsFilterDto();
		leaveAnalyticsFilterResponseDto2.setAnalyticsType(OrganizationalLeaveAnalyticsKPIType.VACATION_USAGE_RATE);
		leaveAnalyticsFilterResponseDto2.setOrganizationalLeaveAnalyticsDto(leaveAbsenceVacationAnalyticsDtoList2);

		// Main response DTO list
		List<LeaveAnalyticsFilterDto> leaveAnalyticsFilterResponseDtoList = new ArrayList<>();
		leaveAnalyticsFilterResponseDtoList.add(leaveAnalyticsFilterResponseDto);
		leaveAnalyticsFilterResponseDtoList.add(leaveAnalyticsFilterResponseDto2);

		return new ResponseEntityDto(false, leaveAnalyticsFilterResponseDtoList);
	}

	@Override
	@Transactional
	public ResponseEntityDto getOrganizationalAbsenceRate(List<Long> teamIds) {
		if (teamIds == null || teamIds.isEmpty()) {
			OrganizationalAbsenceRateAnalyticsDto absenceRateAnalyticsDto = new OrganizationalAbsenceRateAnalyticsDto();
			absenceRateAnalyticsDto.setCurrentAbsenceRate(0.0f);
			absenceRateAnalyticsDto.setMonthBeforeAbsenceRate(0.0f);
			absenceRateAnalyticsDto.setType(OrganizationalLeaveAnalyticsKPIAbsenceType.CURRENT_ABSENCE_RATE);
			return new ResponseEntityDto(false, absenceRateAnalyticsDto);
		}

		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();
		User currentUser = userService.getCurrentUser();
		EmployeeRole employeeRole = currentUser.getEmployee().getEmployeeRole();
		boolean isLeaveAdmin = employeeRole.getLeaveRole() != null
				&& employeeRole.getLeaveRole().equals(Role.LEAVE_ADMIN);

		LocalDate twoMonthsBackCurrentDay = currentDate.minusDays(59);
		LocalDate oneMonthBackCurrentDay = currentDate.minusDays(29);

		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<LocalDate> holidayDates = holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();
		List<Team> teams = teamDao.findByTeamIdIn(teamIds);
		LeaveModuleUtil.validateTeamsForLeaveAnalytics(teamIds, currentUser, teams);

		List<Employee> allEmployees = teamIds.contains(-1L) ? employeeDao.findAll()
				: employeeTeamDao.getEmployeesByTeamIds(teamIds, currentUser.getUserId(), isLeaveAdmin);

		String organizationTimeZone = organizationService.getOrganizationTimeZone();

		int numOfWorkingDaysSinceTwoMonthsBackToCurrent = CommonModuleUtils.addUpWorkingDaysForAllEmployee(allEmployees,
				oneMonthBackCurrentDay, currentDate, timeConfigs, holidayDates, organizationTimeZone);
		int numOfWorkingDaysSinceTwoMonthsBackToOneMonth = CommonModuleUtils.addUpWorkingDaysForAllEmployee(
				allEmployees, twoMonthsBackCurrentDay, oneMonthBackCurrentDay, timeConfigs, holidayDates,
				organizationTimeZone);

		float absenceRateForCurrentDate = getAbsenceRateForPastThirtyWorkingDays(oneMonthBackCurrentDay, currentDate,
				timeConfigs, holidayDates, teamIds);
		float absenceRateForTwoMonthsBack = getAbsenceRateForPastThirtyWorkingDays(twoMonthsBackCurrentDay,
				oneMonthBackCurrentDay, timeConfigs, holidayDates, teamIds);

		OrganizationalAbsenceRateAnalyticsDto absenceRateAnalyticsDtos = new OrganizationalAbsenceRateAnalyticsDto();
		absenceRateAnalyticsDtos.setType(OrganizationalLeaveAnalyticsKPIAbsenceType.CURRENT_ABSENCE_RATE);
		absenceRateAnalyticsDtos
			.setCurrentAbsenceRate((absenceRateForCurrentDate / numOfWorkingDaysSinceTwoMonthsBackToCurrent) * 100);
		absenceRateAnalyticsDtos.setMonthBeforeAbsenceRate(
				(absenceRateForTwoMonthsBack / numOfWorkingDaysSinceTwoMonthsBackToOneMonth) * 100);

		return new ResponseEntityDto(false, absenceRateAnalyticsDtos);
	}

	private float getAbsenceRateForCurrentDate(LocalDate firstDateOfYear, LocalDate comparisonEndDate,
			Integer workingDays, List<TimeConfig> timeConfigs, List<LocalDate> holidayDates, Long employeeCounts) {
		Float noOfDaysOfEmployeeLeaveRequests = leaveRequestDao.findAllEmployeeRequestsByDateRangeQuery(firstDateOfYear,
				comparisonEndDate, CommonModuleUtils.getWorkingDaysIndex(timeConfigs), holidayDates);

		float x = noOfDaysOfEmployeeLeaveRequests / (workingDays * employeeCounts);
		float y = x * 100;

		log.info("getAbsenceRateForCurrentDate: execution end by user: {}", noOfDaysOfEmployeeLeaveRequests);
		return (Float.isNaN(y)) ? 0 : y;
	}

	/**
	 * Util methods
	 */
	private float getAbsenceRateForTwoMonthsBack(LocalDate firstDateOfYear, LocalDate twoMonthsBackLastDay,
			Integer workingDays, Long employeeCounts, List<TimeConfig> timeConfigs, List<LocalDate> holidayDates) {
		/*
		 * x = employee leave request (start of the year to 2 months back) / (working days
		 * between start of the year to 2 months back from current month * total active
		 * employee count) y = (x / count of months between start of the year to 2 months
		 * back from current month) * 100 y => average absence rate as percentage
		 */
		Float noOfDaysOfEmployeeLeaveRequests = leaveRequestDao.findAllEmployeeRequestsByDateRangeQuery(firstDateOfYear,
				twoMonthsBackLastDay, CommonModuleUtils.getWorkingDaysIndex(timeConfigs), holidayDates);

		// This will return one month behind the actual count, therefore, need to add one
		long monthCount = ChronoUnit.MONTHS.between(YearMonth.from(firstDateOfYear),
				YearMonth.from(twoMonthsBackLastDay)) + 1;

		float x = noOfDaysOfEmployeeLeaveRequests / (workingDays * employeeCounts);
		float y = (x / monthCount) * 100;

		log.info("employeeLeaveRequests: execution end by user: {}", noOfDaysOfEmployeeLeaveRequests);
		int currentMonth = DateTimeUtils.getMonthValue(DateTimeUtils.getCurrentUtcDate());

		LeaveCycleDetailsDto leaveCycleDetail = leaveCycleService.getLeaveCycleConfigs();
		// if the current month is January or February, the absence rate will be 0 since
		// neglecting data for the previous year
		return (Float.isNaN(y) || (currentMonth == leaveCycleDetail.getStartMonth()
				|| currentMonth == leaveCycleDetail.getStartMonth() - 1)) ? 0 : y;
	}

	private float getAbsenceRateForPastThirtyWorkingDays(LocalDate firstDateOfYear, LocalDate twoMonthsBackLastDay,
			List<TimeConfig> timeConfigs, List<LocalDate> holidayDates, List<Long> teamIds) {
		return leaveRequestDao.findAllEmployeeRequestsByWithinThirtyDays(firstDateOfYear, twoMonthsBackLastDay,
				timeConfigs, holidayDates, teamIds.contains(-1L) ? null : teamIds,
				organizationService.getOrganizationTimeZone());
	}

	private float getMonthOnMonthAbsenceRate(LocalDate lastMonthFirstDay, LocalDate lastMonthLastDay,
			Long employeeCounts, float absenceRate, List<TimeConfig> timeConfigs, List<LocalDate> holidayDates) {
		/*
		 * absence rate of last month = last month leave count / (working days for last
		 * month * total employee count) * 100 month on month absence rate = absence rate
		 * of last month - absenceRate
		 */
		Float lastMonthLeaveCount = leaveRequestDao.findAllEmployeeRequestsByDateRangeQuery(lastMonthFirstDay,
				lastMonthLastDay, CommonModuleUtils.getWorkingDaysIndex(timeConfigs), holidayDates);
		int numOfWorkingDaysLastMonth = CommonModuleUtils.getWorkingDaysBetweenTwoDates(lastMonthFirstDay,
				lastMonthLastDay, timeConfigs, holidayDates, organizationService.getOrganizationTimeZone());

		float absenceRateOfLastMonth = (lastMonthLeaveCount / (numOfWorkingDaysLastMonth * employeeCounts)) * 100;
		int currentMonth = DateTimeUtils.getMonthValue(DateTimeUtils.getCurrentUtcDate());

		// if the current month is January, the absence rate will be 0 since neglecting
		// data for the previous year
		return currentMonth == 0 ? 0 : absenceRateOfLastMonth - absenceRate;
	}

	private float getAnnualVacationUsageRate(LocalDate firstDateOfYear, LocalDate lastDateOfYear,
			LocalDate currentDate) {
		// vacation usage rate = total number of annuals taken / total annuals given
		LeaveType leaveType = leaveTypeDao.findLeaveTypeByName("annual");

		Float totalNoOfDaysOfAnnualsAllocated = leaveEntitlementDao
			.findAllEmployeesAnnualEntitlementDaysByDateRangeQuery(leaveType.getTypeId(), firstDateOfYear,
					lastDateOfYear);

		Float totalNoOfDaysOfAnnualsUsed = leaveRequestDao
			.findAllEmployeeAnnualDaysByDateRangeQuery(leaveType.getTypeId(), firstDateOfYear, currentDate);

		float vacationUsageRate = (totalNoOfDaysOfAnnualsUsed / totalNoOfDaysOfAnnualsAllocated) * 100;

		return (Float.isNaN(vacationUsageRate)) ? 0 : vacationUsageRate;
	}

	private List<TeamResourceAvailabilityResponseDto> createTeamResourceAvailabilityResponseDToByDay(
			ManagerTeamResourceAvailabilityDto managerTeamResourceAvailabilityDto) {
		List<TeamResourceAvailabilityResponseDto> teamAvailabilityResponseDto = new ArrayList<>();
		LocalDate currentDate = managerTeamResourceAvailabilityDto.getStartDate();
		while (currentDate.isBefore(managerTeamResourceAvailabilityDto.getEndDate())
				|| currentDate.equals(managerTeamResourceAvailabilityDto.getEndDate())) {
			if (CommonModuleUtils.checkIfDayIsWorkingDay(currentDate, timeConfigDao.findAll(),
					organizationService.getOrganizationTimeZone())) {
				TeamResourceAvailabilityResponseDto dto = new TeamResourceAvailabilityResponseDto();
				dto.setDate(currentDate);
				teamAvailabilityResponseDto.add(dto);
			}
			currentDate = DateTimeUtils.incrementDays(currentDate, 1);
		}
		return teamAvailabilityResponseDto;
	}

	private void setTeamResourceAvailabilityResponseDtos(List<Holiday> holidayList, List<LeaveRequest> leaveRequests,
			List<Long> teamIds, TeamResourceAvailabilityResponseDto responseDto) {
		List<EmployeeLeaveRequestListResponseDto> employeeLeaveRequestResponseDtos = new ArrayList<>();
		if (holidayList.isEmpty()) {
			for (LeaveRequest lr : leaveRequests) {
				if ((responseDto.getDate().isEqual(lr.getStartDate())
						|| responseDto.getDate().isAfter(lr.getStartDate()))
						&& (responseDto.getDate().isEqual(lr.getEndDate())
								|| responseDto.getDate().isBefore(lr.getEndDate()))) {
					EmployeeResponseDto employeeDto = peopleMapper.employeeToEmployeeResponseDto(lr.getEmployee());

					// Find the existing EmployeeLeaveRequestListResponseDto for the
					// employee and the same day
					Optional<EmployeeLeaveRequestListResponseDto> existingOptionalEmployeeLeaveRequestList = Optional
						.empty();
					if (!employeeLeaveRequestResponseDtos.isEmpty()) {
						existingOptionalEmployeeLeaveRequestList = employeeLeaveRequestResponseDtos.stream()
							.filter(employeeLeaveRequestResponseDto -> employeeLeaveRequestResponseDto
								.getEmployeeResponseDto()
								.getEmployeeId()
								.equals(employeeDto.getEmployeeId()))
							.findFirst();
					}

					if (existingOptionalEmployeeLeaveRequestList.isPresent()) {
						// EmployeeLeaveRequestListResponseDto for the employee and day
						// already exists in the list
						EmployeeLeaveRequestListResponseDto existingEmployeeLeaveRequestList = existingOptionalEmployeeLeaveRequestList
							.get();
						List<LeaveRequestResponseDto> leaveRequestResponseDtoList = existingEmployeeLeaveRequestList
							.getLeaveRequestResponseDto();
						leaveRequestResponseDtoList.add(leaveMapper.leaveRequestToLeaveRequestResponseDto(lr));
					}
					else {
						EmployeeLeaveRequestListResponseDto newEmployeeLeaveRequestList = new EmployeeLeaveRequestListResponseDto();
						newEmployeeLeaveRequestList.setEmployeeResponseDto(employeeDto);

						List<LeaveRequestResponseDto> leaveRequestResponseDtoList = new ArrayList<>();
						leaveRequestResponseDtoList.add(leaveMapper.leaveRequestToLeaveRequestResponseDto(lr));
						newEmployeeLeaveRequestList.setLeaveRequestResponseDto(leaveRequestResponseDtoList);

						employeeLeaveRequestResponseDtos.add(newEmployeeLeaveRequestList);
					}
				}
			}

			responseDto.setEmployeesOnLeaveRequestResponseDtos(employeeLeaveRequestResponseDtos);
			responseDto.setAvailabilityStatus(employeeLeaveRequestResponseDtos.isEmpty()
					? EmployeeAvailabilityStatus.FULL : EmployeeAvailabilityStatus.PARTIAL);

			List<Employee> teamEmployees = teamDao.findEmployeesByTeamIds(teamIds);

			Integer availableEmployeeCount = teamEmployees.size() - employeeLeaveRequestResponseDtos.size();
			responseDto.setAvailableEmployeeCount(availableEmployeeCount);
		}
		else {
			responseDto.setHolidayResponseDto(peopleMapper.holidaysToHolidayResponseDtoList(holidayList));
			responseDto.setAvailabilityStatus(EmployeeAvailabilityStatus.HOLIDAY);
			responseDto.setAvailableEmployeeCount(0);
		}

	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTeamLeaveHistory(Long id, TeamLeaveHistoryFilterDto teamLeaveHistoryFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("getTeamLeaveHistory: execution started by user: {}", currentUser.getUserId());

		Optional<Team> teamOptional = teamDao.findByTeamIdAndIsActive(id, true);
		if (teamOptional.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND);
		}
		isTeamUnderCurrentUserSupervision(currentUser, teamOptional.get(), "Leave History");

		if (teamLeaveHistoryFilterDto.getTeamMemberIds() != null) {
			List<Long> teamMemberIds = employeeTeamDao.findEmployeeTeamsByTeam(teamOptional.get())
				.stream()
				.map(EmployeeTeam::getEmployee)
				.map(Employee::getEmployeeId)
				.toList();
			List<Long> employeeIds = teamLeaveHistoryFilterDto.getTeamMemberIds();
			if (!new HashSet<>(teamMemberIds).containsAll(employeeIds)) {
				throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_MEMBER_IDS_NOT_VALID);
			}
		}

		if (teamLeaveHistoryFilterDto.getStartDate() != null && teamLeaveHistoryFilterDto.getEndDate() != null
				&& teamLeaveHistoryFilterDto.getStartDate().isAfter(teamLeaveHistoryFilterDto.getEndDate())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_START_DATE_END_DATE_NOT_VALID);
		}

		int pageSize = teamLeaveHistoryFilterDto.getSize();
		boolean isExport = teamLeaveHistoryFilterDto.getIsExport();
		if (isExport) {
			pageSize = Integer.MAX_VALUE;
		}
		Pageable pageable = PageRequest.of(teamLeaveHistoryFilterDto.getPage(), pageSize,
				Sort.by(teamLeaveHistoryFilterDto.getSortOrder(), teamLeaveHistoryFilterDto.getSortKey().toString()));
		Page<LeaveRequest> leaveRequests = leaveRequestDao.getLeaveRequestHistoryByTeam(id, teamLeaveHistoryFilterDto,
				pageable);
		PageDto pageDto = pageTransformer.transform(leaveRequests);

		List<EmployeeLeaveRequestResponseDto> responseDtos = new ArrayList<>();
		for (LeaveRequest lr : leaveRequests) {
			EmployeeLeaveRequestResponseDto employeeLeaveRequestResponseDto = new EmployeeLeaveRequestResponseDto();
			LeaveRequestResponseDto leaveRequestResponseDto = leaveMapper.leaveRequestToLeaveRequestResponseDto(lr);
			EmployeeBasicDetailsResponseDto employeeResponseDto = peopleMapper
				.employeeToEmployeeBasicDetailsResponseDto(lr.getEmployee());
			employeeLeaveRequestResponseDto.setLeaveRequestResponseDto(leaveRequestResponseDto);
			employeeLeaveRequestResponseDto.setEmployeeResponseDto(employeeResponseDto);
			responseDtos.add(employeeLeaveRequestResponseDto);
		}
		pageDto.setItems(responseDtos);

		log.info("getTeamLeaveHistory: execution ended successfully by returning {} leave requests",
				responseDtos.size());
		return new ResponseEntityDto(false, pageDto);
	}

	public boolean invalidStartAndEndDate(LocalDate startDate, LocalDate endDate) {
		return startDate.getYear() < DateTimeUtils.getCurrentYear() - 1
				|| endDate.getYear() < DateTimeUtils.getCurrentYear() - 1 || startDate.isAfter(endDate)
				|| endDate.isBefore(startDate);
	}

	@Override
	public ResponseEntityDto getTeamLeaveSummary(Long id) {
		User currentUser = userService.getCurrentUser();
		log.info("getTeamLeaveSummary: execution started by user: {}", currentUser.getUserId());

		Optional<Team> teamOptional = teamDao.findByTeamIdAndIsActive(id, true);
		if (teamOptional.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND);
		}
		isTeamUnderCurrentUserSupervision(currentUser, teamOptional.get(), "Leave Summary");

		List<LocalDate> holidayDates = holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<Integer> workingDays = CommonModuleUtils.getWorkingDaysIndex(timeConfigs);

		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();
		LeaveCycleDetailsDto leaveCycleDetail = leaveCycleService.getLeaveCycleConfigs();
		int cycleEndYear = LeaveModuleUtil.getLeaveCycleEndYear(leaveCycleDetail.getStartMonth() - 1,
				leaveCycleDetail.getStartDate());
		LocalDate cycleStartDate = LocalDate
			.of(leaveCycleDetail.getStartMonth() == 1 && leaveCycleDetail.getStartDate() == 1 ? cycleEndYear
					: cycleEndYear - 1, leaveCycleDetail.getStartMonth(), leaveCycleDetail.getStartDate());

		List<TeamLeaveCountByType> teamLeaveCountByTypeForYear = leaveRequestDao.findTeamLeaveCountByType(id,
				workingDays, holidayDates, cycleStartDate, currentDate);

		Float leaveTakenCount = (float) teamLeaveCountByTypeForYear.stream()
			.mapToDouble(TeamLeaveCountByType::getLeaveDaysCount)
			.sum();

		Map<Integer, Double> leaveCountByType = teamLeaveCountByTypeForYear.stream()
			.collect(Collectors.groupingBy(TeamLeaveCountByType::getLeaveType,
					Collectors.summingDouble(TeamLeaveCountByType::getLeaveDaysCount)));

		LocalDate startDateOfPreviousMonth = currentDate.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth());
		LocalDate endDateOfPreviousMonth = currentDate.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth());
		Float rateForPreviousMonth = getAbsentRate(id, workingDays, holidayDates, timeConfigs, startDateOfPreviousMonth,
				endDateOfPreviousMonth);

		LocalDate firstDateOfYear = LocalDate.of(currentDate.getYear(), 1, 1);
		LocalDate lastDateUptPreviousMonth = currentDate.minusMonths(2).with(TemporalAdjusters.lastDayOfMonth());
		Float rateUptoPreviousMonth = getAbsentRate(id, workingDays, holidayDates, timeConfigs, firstDateOfYear,
				lastDateUptPreviousMonth) / lastDateUptPreviousMonth.getMonthValue();

		LinkedHashMap<LeaveType, Long> allocatedEmployeeCountForLeaveType = leaveEntitlementDao
			.findLeaveTypeAndEmployeeCountForTeam(id);

		Map<Long, Double> allocatedLeaveDaysCountForLeaveType = leaveEntitlementDao
			.findLeaveTypeIdAllocatedLeaveDaysForTeam(id);

		List<AverageLeaveConsumptionDto> averageLeaveConsumptionDtos = getAverageLeaveConsumptionDtos(
				allocatedEmployeeCountForLeaveType, allocatedLeaveDaysCountForLeaveType, leaveCountByType);

		TeamLeaveSummaryResponseDto responseDto = new TeamLeaveSummaryResponseDto();

		responseDto.setLeaveTakenCount(leaveTakenCount);
		/*
		 * month by month rate = previous month absent rate - absent rate upto previous
		 * month from the start of current year previous month absent rate = (leave count
		 * of previous month / total working days of previous month)*100 absent rate upto
		 * previous month from the start of current year = ((leave count of the
		 * period/working days count of the period)*100)/number of months in considered
		 * time period
		 */
		responseDto.setMonthOverMonthRate(rateForPreviousMonth - rateUptoPreviousMonth);
		responseDto.setAverageConsumptionByType(averageLeaveConsumptionDtos);

		log.info("getTeamLeaveSummary: execution ended successfully");
		return new ResponseEntityDto(false, responseDto);
	}

	private Float getAbsentRate(Long id, List<Integer> workingDays, List<LocalDate> holidayDates,
			List<TimeConfig> timeConfigs, LocalDate startDate, LocalDate endDate) {
		List<TeamLeaveCountByType> teamLeaveCountByTypeForPeriod = leaveRequestDao.findTeamLeaveCountByType(id,
				workingDays, holidayDates, startDate, endDate);
		int workingDaysCountInPeriod = CommonModuleUtils.getWorkingDaysBetweenTwoDates(startDate, endDate, timeConfigs,
				holidayDates, organizationService.getOrganizationTimeZone());
		double totalTeamLeaveCountForPeriod = teamLeaveCountByTypeForPeriod.stream()
			.mapToDouble(TeamLeaveCountByType::getLeaveDaysCount)
			.sum();
		return workingDaysCountInPeriod > 0 ? (float) ((totalTeamLeaveCountForPeriod / workingDaysCountInPeriod) * 100)
				: 0.0f;
	}

	private List<AverageLeaveConsumptionDto> getAverageLeaveConsumptionDtos(
			LinkedHashMap<LeaveType, Long> allocatedEmployeeCountForLeaveType,
			Map<Long, Double> allocatedLeaveDaysCountForLeaveType, Map<Integer, Double> leaveCountByType) {
		List<AverageLeaveConsumptionDto> averageLeaveConsumptionDtos = new ArrayList<>();
		for (Map.Entry<LeaveType, Long> entry : allocatedEmployeeCountForLeaveType.entrySet()) {
			AverageLeaveConsumptionDto averageLeaveConsumptionDto = new AverageLeaveConsumptionDto();
			averageLeaveConsumptionDto.setLeaveType(leaveMapper.leaveTypeToLeaveTypeBasicInfoDto(entry.getKey()));
			Double totalLeavesOfType = leaveCountByType.get(entry.getKey().getTypeId().intValue()) == null ? 0
					: leaveCountByType.get(entry.getKey().getTypeId().intValue());
			Long allocatedEmployeeCount = entry.getValue();

			float averageConsumption = 0F;

			if (allocatedEmployeeCount != 0) {
				averageConsumption = (float) (totalLeavesOfType / allocatedEmployeeCount);
			}

			averageLeaveConsumptionDto.setAverageConsumption(averageConsumption);

			double totalAllocatedDays = allocatedLeaveDaysCountForLeaveType.get(entry.getKey().getTypeId()) == null ? 0
					: allocatedLeaveDaysCountForLeaveType.get(entry.getKey().getTypeId());

			// leave consumption percentage =
			// (total used leave days of leave type by team/total allocated leave days for
			// a team based on leave type)*100
			float averageConsumptionPercentage = 0F;
			if (totalAllocatedDays != 0 && allocatedEmployeeCount != 0) {
				float allocatedConsumptionAverage = (float) (totalAllocatedDays / allocatedEmployeeCount);
				averageConsumptionPercentage = averageConsumption / allocatedConsumptionAverage * 100;
			}
			averageLeaveConsumptionDto.setConsumedPercentage(averageConsumptionPercentage);
			averageLeaveConsumptionDtos.add(averageLeaveConsumptionDto);
		}
		return averageLeaveConsumptionDtos;
	}

	@Override
	@Transactional
	public ResponseEntityDto getEmployeeLeaveHistory(@NonNull Long id,
			EmployeeLeaveHistoryFilterDto employeeLeaveHistoryFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("getEmployeeLeaveHistory: execution started by user: {}", currentUser.getUserId());

		Optional<Employee> employeeOptional = employeeDao.findById(id);
		if (employeeOptional.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND);
		}
		isEmployeeUnderCurrentUserSupervision(currentUser, employeeOptional.get(), "Leave History");

		if (employeeLeaveHistoryFilterDto.getStartDate().isAfter(employeeLeaveHistoryFilterDto.getEndDate())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_START_DATE_END_DATE_NOT_VALID);
		}

		int pageSize = employeeLeaveHistoryFilterDto.getSize();
		boolean isExport = employeeLeaveHistoryFilterDto.getIsExport();
		if (isExport) {
			pageSize = Integer.MAX_VALUE;
		}
		Pageable pageable = PageRequest.of(employeeLeaveHistoryFilterDto.getPage(), pageSize,
				employeeLeaveHistoryFilterDto.getSortOrder(), employeeLeaveHistoryFilterDto.getSortKey().toString());
		Page<LeaveRequest> leaveRequests = leaveRequestDao.findAllLeaveRequestsByEmployeeId(id,
				employeeLeaveHistoryFilterDto, pageable);
		PageDto pageDto = pageTransformer.transform(leaveRequests);

		List<LeaveRequestResponseDto> leaveRequestResponseDtoList = leaveMapper
			.leaveRequestListToLeaveRequestResponseDtoList(
					leaveRequests.hasContent() ? leaveRequests.getContent() : Collections.emptyList());
		pageDto.setItems(leaveRequestResponseDtoList);

		log.info("getEmployeeLeaveHistory: execution ended with {} result(s)", leaveRequestResponseDtoList.size());
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	public ResponseEntityDto getTeamsByTeamLead(TeamFilterDto teamFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("getTeamsByTeamLead: execution started by user: {}", currentUser.getUserId());

		Long id = currentUser.getUserId();

		List<Team> managerLeadingTeams = teamDao.findLeadingTeamsByManagerId(id);
		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();

		List<String> workingDays = timeConfigDao.findAll()
			.stream()
			.map(TimeConfig::getDay)
			.map(DayOfWeek::toString)
			.toList();

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EE", Locale.ENGLISH);
		String checkingDay = currentDate.format(formatter).toUpperCase();
		List<Holiday> holidayList = holidayDao.findAllByIsActiveTrueAndDate(currentDate);

		boolean isNonWorkingDay = !workingDays.contains(checkingDay) || !holidayList.isEmpty();

		List<ManagerTeamResponseDto> managerTeamResponseDtos = new ArrayList<>();
		List<ManagerSummarizedTeamResponseDto> employeeFormattedTeamResponseDto = peopleMapper
			.managerTeamsToManagerTeamCountTeamResponseDto(managerLeadingTeams);

		EmployeesOnLeaveFilterDto employeesOnLeaveFilterDto = new EmployeesOnLeaveFilterDto();
		employeesOnLeaveFilterDto.setDate(currentDate);

		for (ManagerSummarizedTeamResponseDto team : employeeFormattedTeamResponseDto) {
			employeesOnLeaveFilterDto.setTeamIds(List.of(team.getTeamId()));

			ManagerTeamResponseDto managerTeamResponseDto = new ManagerTeamResponseDto();
			managerTeamResponseDto.setTeamId(team.getTeamId());
			managerTeamResponseDto.setTeamName(team.getTeamName());
			managerTeamResponseDto.setEmployees(team.getEmployees());
			managerTeamResponseDto.setIsNonWorkingDay(isNonWorkingDay);

			if (!isNonWorkingDay) {

				EmployeeRole employeeRole = currentUser.getEmployee().getEmployeeRole();
				boolean isLeaveAdmin = employeeRole.getPeopleRole().equals(Role.PEOPLE_ADMIN);
				AdminOnLeaveDto employeeOnLeaveDto = employeeDao.findAllEmployeesOnLeave(employeesOnLeaveFilterDto,
						currentUser.getUserId(), isLeaveAdmin);
				managerTeamResponseDto.setOnlineCount(employeeOnLeaveDto.getOnlineCount());
				managerTeamResponseDto.setOnLeaveCount(employeeOnLeaveDto.getOnLeaveCount());
			}

			managerTeamResponseDtos.add(managerTeamResponseDto);
		}

		log.info("getTeamsByTeamLead: execution ended with {} result(s)", managerTeamResponseDtos.size());
		return new ResponseEntityDto(false, managerTeamResponseDtos);
	}

	@Override
	public ResponseEntityDto getIndividualsByManager(EmployeeFilterDto employeeFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("getIndividualsByManager: execution started");

		Long id = currentUser.getUserId();

		int pageSize = employeeFilterDto.getSize();
		if (employeeFilterDto.getIsExport() != null && employeeFilterDto.getIsExport()) {
			pageSize = Integer.MAX_VALUE;
		}

		Pageable pageable = PageRequest.of(employeeFilterDto.getPage(), pageSize, employeeFilterDto.getSortOrder(),
				employeeFilterDto.getSortKey().toString());

		Page<Employee> employees = employeeDao.findEmployeesByManagerId(id, pageable);

		PageDto pageDto = pageTransformer.transform(employees);

		List<EmployeeDetailedResponseDto> employeeResponseDtos = peopleMapper
			.employeeListToEmployeeDetailedResponseDtoList(
					employees.hasContent() ? employees.getContent() : Collections.emptyList());

		pageDto.setItems(employeeResponseDtos);

		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	public ResponseEntityDto getEmployeeLeaveEntitlements(@NonNull Long employeeId,
			LeaveEntitlementsFilterDto leaveEntitlementsFilterDto) {
		log.info("getEmployeeLeaveEntitlements: execution started");

		User currentUser = userService.getCurrentUser();
		Optional<Employee> employee = employeeDao.findById(employeeId);

		if (employee.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND);
		}

		Role leaveRole = currentUser.getEmployee().getEmployeeRole().getLeaveRole();

		if (leaveRole.equals(Role.LEAVE_ADMIN)) {
			HashMap<Long, LeaveEntitlementResponseDto> responseDtoList = processedLeaveEntitlements(employeeId,
					leaveEntitlementsFilterDto);
			return new ResponseEntityDto(false, responseDtoList.values());
		}

		if (leaveRole.equals(Role.LEAVE_MANAGER)) {
			List<Employee> employeeManagers = employeeDao.findManagersByEmployeeIdAndLoggedInManagerId(employeeId,
					currentUser.getEmployee().getEmployeeId());

			if (!employeeManagers.isEmpty()) {
				HashMap<Long, LeaveEntitlementResponseDto> responseDtoList = processedLeaveEntitlements(employeeId,
						leaveEntitlementsFilterDto);
				return new ResponseEntityDto(false, responseDtoList.values());
			}
		}

		log.info("getEmployeeLeaveEntitlements: execution ended");
		return new ResponseEntityDto();
	}

	private HashMap<Long, LeaveEntitlementResponseDto> processedLeaveEntitlements(Long employeeId,
			LeaveEntitlementsFilterDto leaveEntitlementsFilterDto) {

		List<LeaveEntitlement> leaveEntitlements = leaveEntitlementDao.findAllByEmployeeId(employeeId,
				leaveEntitlementsFilterDto);

		LinkedHashMap<Long, LeaveEntitlementResponseDto> responseDtoList = new LinkedHashMap<>();
		leaveEntitlements.forEach(leaveEntitlement -> processLeaveEntitlements(responseDtoList, leaveEntitlement));

		return responseDtoList;
	}

	private void processLeaveEntitlements(Map<Long, LeaveEntitlementResponseDto> responseDtoList,
			LeaveEntitlement entitlement) {
		long typeID = entitlement.getLeaveType().getTypeId();
		LeaveEntitlementResponseDto filterResponseListDto = responseDtoList.get(typeID);

		if (filterResponseListDto != null) {
			filterResponseListDto.setTotalDaysAllocated(
					filterResponseListDto.getTotalDaysAllocated() + entitlement.getTotalDaysAllocated());
			filterResponseListDto
				.setTotalDaysUsed(filterResponseListDto.getTotalDaysUsed() + entitlement.getTotalDaysUsed());
			filterResponseListDto.setBalanceInDays(
					filterResponseListDto.getTotalDaysAllocated() - filterResponseListDto.getTotalDaysUsed());
			if (filterResponseListDto.getValidFrom().isAfter(entitlement.getValidFrom())) {
				filterResponseListDto.setValidFrom(getEntitlementValidFromDate(entitlement.getValidFrom()));
			}
			if (filterResponseListDto.getValidTo().isBefore(entitlement.getValidTo())) {
				filterResponseListDto.setValidTo(getEntitlementValidToDate(entitlement.getValidTo()));
			}
		}
		else {
			Float totalAllocatedDays = entitlement.getTotalDaysAllocated();
			Float totalUsedDays = entitlement.getTotalDaysUsed();
			Float leaveBalanceInDays = totalAllocatedDays - totalUsedDays;
			LocalDate validFrom = getEntitlementValidFromDate(entitlement.getValidFrom());
			LocalDate validTo = getEntitlementValidToDate(entitlement.getValidTo());
			String reason = entitlement.getReason();
			boolean isManual = entitlement.isManual();
			boolean isOverride = entitlement.isOverride();
			Employee employee = entitlement.getEmployee();
			responseDtoList.put(typeID,
					new LeaveEntitlementResponseDto(entitlement.getEntitlementId(),
							leaveMapper.leaveTypeToLeaveTypeBasicDetailsResponseDto(entitlement.getLeaveType()),
							validFrom, validTo, true, totalAllocatedDays, totalUsedDays, leaveBalanceInDays, reason,
							isManual, isOverride, peopleMapper.employeeToEmployeeBasicDetailsResponseDto(employee)));
		}
	}

	private LocalDate getEntitlementValidFromDate(LocalDate date) {
		LeaveCycleDetailsDto leaveCycleDetailsDto = new LeaveCycleDetailsDto();
		int cycleEndYear = LeaveModuleUtil.getLeaveCycleEndYear(leaveCycleDetailsDto.getStartMonth() - 1,
				leaveCycleDetailsDto.getStartDate());
		int leaveCycleStartYear = leaveCycleDetailsDto.getStartMonth() == 1 && leaveCycleDetailsDto.getStartDate() == 1
				? cycleEndYear : cycleEndYear - 1;
		return date == null ? DateTimeUtils.getUtcLocalDate(leaveCycleStartYear,
				leaveCycleDetailsDto.getStartMonth() - 1, leaveCycleDetailsDto.getStartDate()) : date;
	}

	private LocalDate getEntitlementValidToDate(LocalDate date) {
		LeaveCycleDetailsDto leaveCycleDetailsDto = new LeaveCycleDetailsDto();
		int cycleEndYear = LeaveModuleUtil.getLeaveCycleEndYear(leaveCycleDetailsDto.getStartMonth() - 1,
				leaveCycleDetailsDto.getStartDate());
		return date == null ? DateTimeUtils.getUtcLocalDate(cycleEndYear, leaveCycleDetailsDto.getEndMonth() - 1,
				leaveCycleDetailsDto.getEndDate()) : date;
	}

	@Override
	public ResponseEntityDto getEntitlementsByLeaveTypeJobRoleTeam(
			LeaveEntitlementEmployeeDto leaveEntitlementEmployeeDto) {
		log.info("getEntitlementsByLeaveTypeJobRoleTeam: execution started");

		PageDto pageDto = new PageDto();
		LeaveCycleDetailsDto leaveCycleDetailsDto = leaveCycleService.getLeaveCycleConfigs();
		List<Long> employeeIds;

		int year = leaveEntitlementEmployeeDto.getYear();
		validateYear(year);
		int month = leaveCycleDetailsDto.getStartMonth();
		int cycleStartDate = leaveCycleDetailsDto.getStartDate();

		LocalDate cycleStartDay = DateTimeUtils.getUtcLocalDate(year, month, cycleStartDate);
		LocalDate cycleEndDay = DateTimeUtils.calculateEndDateAfterYears(cycleStartDay, 1);

		if (leaveEntitlementEmployeeDto.getJobFamilyId() != null) {
			Optional<JobFamily> jobRole = jobFamilyDao
				.findByJobFamilyIdAndIsActive(leaveEntitlementEmployeeDto.getJobFamilyId(), true);
			if (jobRole.isEmpty()) {
				throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_NOT_FOUND);
			}
		}
		if (leaveEntitlementEmployeeDto.getTeamId() != null) {
			Optional<Team> team = teamDao.findByTeamIdAndIsActive(leaveEntitlementEmployeeDto.getTeamId(), true);
			if (team.isEmpty()) {
				throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND);
			}
		}

		List<Long> leaveTypeIds = leaveEntitlementEmployeeDto.getLeaveTypeId();
		List<LeaveType> leaveTypes = getLeaveTypes(leaveEntitlementEmployeeDto.getLeaveTypeId());
		if (leaveTypeIds.getFirst() == -1) {
			leaveTypeIds = leaveTypes.stream().map(LeaveType::getTypeId).toList();
		}

		int pageSize = leaveEntitlementEmployeeDto.getSize();
		Pageable pageable = PageRequest.of(leaveEntitlementEmployeeDto.getPage(), pageSize,
				leaveEntitlementEmployeeDto.getSortOrder(), leaveEntitlementEmployeeDto.getSortKey().toString());

		employeeIds = leaveEntitlementDao.findEmployeeIdsWithLeaveEntitlement(leaveTypeIds, cycleStartDay, cycleEndDay,
				leaveEntitlementEmployeeDto.getJobFamilyId(), leaveEntitlementEmployeeDto.getTeamId(),
				pageable.getPageSize(), pageable.getOffset());

		List<LeaveReportDto> allEmployees = leaveEntitlementDao.getEmployeeDetailsWithLeaveEntitlements(leaveTypeIds,
				cycleStartDay, cycleEndDay, leaveEntitlementEmployeeDto.getJobFamilyId(),
				leaveEntitlementEmployeeDto.getTeamId(), pageable, employeeIds);

		List<EmployeeLeaveReportResponseDto> responseDtos = new ArrayList<>();

		for (LeaveReportDto lrd : allEmployees) {
			Optional<EmployeeLeaveReportResponseDto> existingEmployeeDto = responseDtos.stream()
				.filter(dto -> dto.getEmployeeId().equals(lrd.getEmployeeId()))
				.findFirst();

			if (existingEmployeeDto.isPresent()) {
				LeaveEntitlementReportDto leaveEntitlementReportDto = leaveMapper
					.leaveReportDtoToLeaveEntitlementReportDto(lrd);
				existingEmployeeDto.get().getLeaveEntitlementReportDtos().add(leaveEntitlementReportDto);
			}
			else {
				EmployeeLeaveReportResponseDto employeeLeaveReportResponseDto = leaveMapper
					.leaveReportDtoToEmployeeLeaveReportResponseDto(lrd);
				LeaveEntitlementReportDto leaveEntitlementReportDto = leaveMapper
					.leaveReportDtoToLeaveEntitlementReportDto(lrd);

				List<LeaveEntitlementReportDto> leaveEntitlementReportDtos = new ArrayList<>();
				leaveEntitlementReportDtos.add(leaveEntitlementReportDto);
				employeeLeaveReportResponseDto.setLeaveEntitlementReportDtos(leaveEntitlementReportDtos);
				responseDtos.add(employeeLeaveReportResponseDto);
			}
		}

		pageDto.setItems(responseDtos);
		long count = leaveEntitlementDao.findEmployeeIdsCountWithLeaveEntitlements(leaveTypeIds, cycleStartDay,
				cycleEndDay, leaveEntitlementEmployeeDto.getJobFamilyId(), leaveEntitlementEmployeeDto.getTeamId());
		pageDto.setTotalItems(count);
		pageDto.setTotalPages(leaveEntitlementEmployeeDto.getSize() == 0 ? 1
				: (int) Math.ceil((double) count / (double) leaveEntitlementEmployeeDto.getSize()));
		pageDto.setCurrentPage(leaveEntitlementEmployeeDto.getPage());

		return new ResponseEntityDto(false, pageDto);
	}

	private void validateYear(int year) {
		if (year <= 0) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_REPORT_YEAR_NOT_VALID);
		}

		int currentYear = Year.now().getValue();
		int previousYear = currentYear - 1;
		int nextYear = currentYear + 1;

		if (year != currentYear && year != previousYear && year != nextYear) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_REPORT_YEAR_NOT_VALID);
		}
	}

	@Override
	public ResponseEntityDto getLeaveReportFile(LeaveEntitlementEmployeeDto leaveEntitlementEmployeeDto) {
		log.info("getLeaveReport: execution started");

		LeaveCycleDetailsDto leaveCycleDetailsDto = leaveCycleService.getLeaveCycleConfigs();
		int year = leaveEntitlementEmployeeDto.getYear();
		validateYear(year);
		int month = leaveCycleDetailsDto.getStartMonth();
		int cycleStartDate = leaveCycleDetailsDto.getStartDate();

		LocalDate cycleStartDay = DateTimeUtils.getUtcLocalDate(year, month, cycleStartDate);
		LocalDate cycleEndDay = DateTimeUtils.calculateEndDateAfterYears(cycleStartDay, 1);

		if (leaveEntitlementEmployeeDto.getJobFamilyId() != null
				&& leaveEntitlementEmployeeDto.getJobFamilyId() != -1L) {
			Optional<JobFamily> jobRole = jobFamilyDao
				.findByJobFamilyIdAndIsActive(leaveEntitlementEmployeeDto.getJobFamilyId(), true);
			if (jobRole.isEmpty()) {
				throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_NOT_FOUND);
			}
		}
		if (leaveEntitlementEmployeeDto.getTeamId() != null && leaveEntitlementEmployeeDto.getTeamId() != -1L) {
			Optional<Team> team = teamDao.findByTeamIdAndIsActive(leaveEntitlementEmployeeDto.getTeamId(), true);
			if (team.isEmpty()) {
				throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND);
			}
		}

		List<Long> leaveTypeIds = leaveEntitlementEmployeeDto.getLeaveTypeId();
		if (leaveTypeIds != null && leaveTypeIds.isEmpty()) {
			leaveTypeIds = List.of(-1L);
		}

		List<String> statuses = new ArrayList<>();
		if (leaveEntitlementEmployeeDto.getLeaveRequestStatus() != null) {
			statuses = leaveEntitlementEmployeeDto.getLeaveRequestStatus().stream().map(Enum::name).toList();
		}

		List<EmployeeLeaveRequestReportExportDto> leaveRequestReportList = leaveRequestDao
			.generateLeaveRequestDetailedReport(leaveTypeIds, cycleStartDay, cycleEndDay,
					leaveEntitlementEmployeeDto.getJobFamilyId(), leaveEntitlementEmployeeDto.getTeamId(), statuses);
		List<EmployeeCustomEntitlementReportExportDto> customAllocationTeamJobDtoList = leaveEntitlementDao
			.generateEmployeeCustomEntitlementDetailedReport(leaveTypeIds, cycleStartDay, cycleEndDay,
					leaveEntitlementEmployeeDto.getJobFamilyId(), leaveEntitlementEmployeeDto.getTeamId());
		List<EmployeeLeaveEntitlementReportExportDto> entitlementTeamJobRole = leaveEntitlementDao
			.getEmployeeLeaveEntitlementsDetailedReport(leaveTypeIds, cycleStartDay, cycleEndDay,
					leaveEntitlementEmployeeDto.getJobFamilyId(), leaveEntitlementEmployeeDto.getTeamId());

		List<EmployeeEntitlementTeamJobRoleDto> employeeEntitlementTeamJobRoleDtos = new ArrayList<>();

		for (EmployeeLeaveEntitlementReportExportDto etj : entitlementTeamJobRole) {
			EmployeeLeaveEntitlementsDto employeeLeaveEntitlementsDto = peopleMapper
				.employeeLeaveEntitlementTeamJobRoleToEmployeeLeaveEntitlementsDto(etj);
			employeeEntitlementTeamJobRoleDtos.stream()
				.filter(dto -> dto.getEmployeeId().equals(etj.getEmployeeId()))
				.findFirst()
				.map(a -> {
					a.getEmployeeLeaveEntitlementsDtos().add(employeeLeaveEntitlementsDto);
					return a;
				})
				.orElseGet(() -> {
					EmployeeEntitlementTeamJobRoleDto employeeEntitlementTeamJobRoleDto = leaveMapper
						.employeeLeaveEntitlementTeamJobRoleToEmployeeEntitlementTeamJobRoleDto(etj);
					EmployeeLeaveEntitlementsDto employeeLeaveEntitlementDto = peopleMapper
						.employeeLeaveEntitlementTeamJobRoleToEmployeeLeaveEntitlementsDto(etj);

					List<EmployeeLeaveEntitlementsDto> employeeLeaveEntitlementsDtos = new ArrayList<>();
					employeeLeaveEntitlementsDtos.add(employeeLeaveEntitlementDto);
					employeeEntitlementTeamJobRoleDto.setEmployeeLeaveEntitlementsDtos(employeeLeaveEntitlementsDtos);
					employeeEntitlementTeamJobRoleDtos.add(employeeEntitlementTeamJobRoleDto);
					return employeeEntitlementTeamJobRoleDto;
				});
		}

		LeaveRequestsEntitlementsCustoms leaveRequestsEntitlementsCustoms = new LeaveRequestsEntitlementsCustoms();
		leaveRequestsEntitlementsCustoms.setEmployeeLeaveRequestTeamJobRoleReports(leaveRequestReportList);
		leaveRequestsEntitlementsCustoms.setEmployeeEntitlementTeamJobRoleDto(employeeEntitlementTeamJobRoleDtos);
		leaveRequestsEntitlementsCustoms.setEmployeeCustomEntitlementTeamJobRoles(customAllocationTeamJobDtoList);

		return new ResponseEntityDto(false, leaveRequestsEntitlementsCustoms);
	}

	public void setStartAndEndDate(LocalDate[] dateRange, LocalDate startDate, LocalDate endDate) {
		if (startDate != null && endDate != null) {
			dateRange[0] = startDate;
			dateRange[1] = endDate;
		}

		if (startDate == null || endDate == null) {
			LeaveCycleDetailsDto leaveCycleDetail = leaveCycleService.getLeaveCycleConfigs();

			int cycleEndYear = LeaveModuleUtil.getLeaveCycleEndYear(leaveCycleDetail.getStartMonth() - 1,
					leaveCycleDetail.getStartDate());

			dateRange[0] = LocalDate.of(leaveCycleDetail.getStartMonth() == 1 && leaveCycleDetail.getStartDate() == 1
					? cycleEndYear : cycleEndYear - 1, leaveCycleDetail.getStartMonth(),
					leaveCycleDetail.getStartDate());
			dateRange[1] = LocalDate.of(cycleEndYear, leaveCycleDetail.getEndMonth(), leaveCycleDetail.getEndDate());
		}
	}

	@Override
	public ResponseEntityDto getEmployeesOnLeaveByTeam(EmployeesOnLeaveFilterDto filterDto) {
		log.info("getEmployeesOnLeaveByTeam: execution started");

		List<String> workingDays = timeConfigDao.findAll()
			.stream()
			.map(TimeConfig::getDay)
			.map(DayOfWeek::toString)
			.toList();
		String checkingDay = new SimpleDateFormat("EE").format(filterDto.getDate()).toUpperCase();

		List<Holiday> holidayList = holidayDao.findAllByIsActiveTrueAndDate(filterDto.getDate());
		boolean isWorkingDay = !workingDays.contains(checkingDay);

		if (!workingDays.contains(checkingDay) || !holidayList.isEmpty()) {
			List<HolidayResponseDto> holidayResponseDtos = leaveMapper.holidaysToHolidayResponseDtoList(holidayList);
			if (isWorkingDay) {
				HolidayResponseDto holiday = new HolidayResponseDto();
				holiday.setDate(filterDto.getDate());
				holiday.setName("Day Off!");
				holidayResponseDtos.add(holiday);
			}
			return new ResponseEntityDto(false, new EmployeesOnLeaveByTeamDto(null, true, holidayResponseDtos));
		}

		if (filterDto.getTeamIds() != null) {
			User currentUser = userService.getCurrentUser();
			EmployeeRole employeeRole = currentUser.getEmployee().getEmployeeRole();
			boolean isLeaveAdmin = employeeRole.getPeopleRole().equals(Role.PEOPLE_ADMIN);
			AdminOnLeaveDto employeeOnLeaveDto = employeeDao.findAllEmployeesOnLeave(filterDto, currentUser.getUserId(),
					isLeaveAdmin);
			List<EmployeeLeaveRequestDto> employeeData = employeeDao.getEmployeesOnLeaveByTeam(filterDto,
					currentUser.getUserId());

			List<EmployeeLeaveRequestListResponseDto> employeeLeaveRequestList = new ArrayList<>();

			for (EmployeeLeaveRequestDto employeeLeaveRequestDto : employeeData) {
				EmployeeResponseDto employee = peopleMapper
					.employeeToEmployeeResponseDto(employeeLeaveRequestDto.getEmployee());

				Optional<EmployeeLeaveRequestListResponseDto> existingOptionalLeaveRequests;
				EmployeeLeaveRequestListResponseDto newEmployeeLeaveRequest = new EmployeeLeaveRequestListResponseDto();
				if (!employeeLeaveRequestList.isEmpty()) {
					existingOptionalLeaveRequests = employeeLeaveRequestList.stream()
						.filter(employeeLeaves -> employeeLeaves.getEmployeeResponseDto()
							.getEmployeeId()
							.equals(employee.getEmployeeId()))
						.findFirst();
					if (existingOptionalLeaveRequests.isPresent()) {
						EmployeeLeaveRequestListResponseDto employeeLeaveRequestResponseDto = existingOptionalLeaveRequests
							.get();
						employeeLeaveRequestResponseDto.getLeaveRequestResponseDto()
							.add(leaveMapper
								.leaveRequestToLeaveRequestResponseDto(employeeLeaveRequestDto.getLeaveRequest()));
					}
					else {
						newEmployeeLeaveRequest.setEmployeeResponseDto(employee);
						List<LeaveRequestResponseDto> leaveRequestsList = new ArrayList<>();
						leaveRequestsList.add(leaveMapper
							.leaveRequestToLeaveRequestResponseDto(employeeLeaveRequestDto.getLeaveRequest()));
						newEmployeeLeaveRequest.setLeaveRequestResponseDto(leaveRequestsList);

						employeeLeaveRequestList.add(newEmployeeLeaveRequest);
					}
				}
				else {
					newEmployeeLeaveRequest.setEmployeeResponseDto(employee);

					List<LeaveRequestResponseDto> leaveRequestsList = new ArrayList<>();
					leaveRequestsList.add(leaveMapper
						.leaveRequestToLeaveRequestResponseDto(employeeLeaveRequestDto.getLeaveRequest()));
					newEmployeeLeaveRequest.setLeaveRequestResponseDto(leaveRequestsList);

					employeeLeaveRequestList.add(newEmployeeLeaveRequest);
				}
			}

			OnLeaveByTeamDto onLeaveByTeamDto = new OnLeaveByTeamDto(employeeOnLeaveDto.getOnLeaveCount(),
					employeeOnLeaveDto.getOnlineCount(), employeeLeaveRequestList);
			log.info("getEmployeesOnLeaveByTeam: Successfully returned all employees on leave by team id : {}",
					filterDto.getTeamIds());
			return new ResponseEntityDto(false, new EmployeesOnLeaveByTeamDto(onLeaveByTeamDto, false, null));
		}
		else {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND);
		}
	}

	@Override
	public ResponseEntityDto getLeaves(LeaveRequestFilterDto leaveRequestFilterDto) {
		log.info("getLeaves: execution started");

		User currentUser = userService.getCurrentUser();

		Long employeeId = currentUser.getUserId();
		List<Team> teams = teamDao.findByTeamIdIn(leaveRequestFilterDto.getTeamIds());
		LeaveModuleUtil.validateTeamsForLeaveAnalytics(leaveRequestFilterDto.getTeamIds(), currentUser, teams);

		Pageable pageable = PageRequest.of(leaveRequestFilterDto.getPage(), leaveRequestFilterDto.getSize(),
				Sort.by(leaveRequestFilterDto.getSortOrder(), String.valueOf(leaveRequestFilterDto.getSortKey())));

		Page<LeaveRequest> leaveRequests = leaveRequestDao.findAllLeaveRequests(employeeId, leaveRequestFilterDto,
				pageable);

		PageDto pageDto = pageTransformer.transform(leaveRequests);
		List<AllLeaveRequestsResponseDto> list = leaveMapper.leaveRequestListToAllLeaveRequestsResponseDtoList(
				leaveRequests.hasContent() ? leaveRequests.getContent() : Collections.emptyList());

		pageDto.setItems(list);

		log.info("getAssignedLeavesToManager: execution ended with {} result(s)", list.size());
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	public ResponseEntityDto getCustomEntitlementsByLeaveTypeJobRoleTeam(
			LeaveEntitlementEmployeeDto leaveEntitlementEmployeeDto) {
		log.info("getCustomEntitlementsByLeaveTypeJobRoleTeam: execution started");

		LeaveCycleDetailsDto leaveCycleDetailsDto = leaveCycleService.getLeaveCycleConfigs();
		LocalDate cycleStartDay = DateTimeUtils.getUtcLocalDate(leaveEntitlementEmployeeDto.getYear(),
				leaveCycleDetailsDto.getStartMonth(), leaveCycleDetailsDto.getStartDate());
		LocalDate cycleEndDay = DateTimeUtils.calculateEndDateAfterYears(cycleStartDay, 1);

		validateTeam(leaveEntitlementEmployeeDto.getTeamId());
		List<Long> leaveTypeIds = getValidatedLeaveTypes(leaveEntitlementEmployeeDto.getLeaveTypeId());

		Pageable pageable = PageRequest.of(leaveEntitlementEmployeeDto.getPage(), leaveEntitlementEmployeeDto.getSize(),
				Sort.by(Sort.Direction.ASC, String.valueOf(leaveEntitlementEmployeeDto.getSortKey())));

		Page<EmployeeCustomEntitlementResponseDto> customAllocationsPage = leaveEntitlementDao
			.generateEmployeeCustomEntitlementDetailedReportWithPagination(leaveTypeIds, cycleStartDay, cycleEndDay,
					leaveEntitlementEmployeeDto.getJobFamilyId(), leaveEntitlementEmployeeDto.getTeamId(), pageable);

		PageDto pageDto = new PageDto();
		pageDto.setItems(customAllocationsPage.getContent());
		pageDto.setCurrentPage(customAllocationsPage.getNumber());
		pageDto.setTotalItems(customAllocationsPage.getTotalElements());
		pageDto.setTotalPages(customAllocationsPage.getTotalPages());

		log.info("getCustomEntitlementsByLeaveTypeJobRoleTeam: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	public ResponseEntityDto getLeaveRequestsByLeaveTypeJobRoleTeam(
			LeaveEntitlementEmployeeDto leaveEntitlementEmployeeDto) {
		log.info("getLeaveRequestsByLeaveTypeJobRoleTeam: execution started");

		LeaveCycleDetailsDto leaveCycleDetailsDto = leaveCycleService.getLeaveCycleConfigs();
		LocalDate cycleStartDay = DateTimeUtils.getUtcLocalDate(leaveEntitlementEmployeeDto.getYear(),
				leaveCycleDetailsDto.getStartMonth(), leaveCycleDetailsDto.getStartDate());
		LocalDate cycleEndDay = DateTimeUtils.calculateEndDateAfterYears(cycleStartDay, 1);

		validateTeam(leaveEntitlementEmployeeDto.getTeamId());

		List<Long> leaveTypeIds = leaveEntitlementEmployeeDto.getLeaveTypeId();
		if (leaveTypeIds != null && leaveTypeIds.isEmpty()) {
			leaveTypeIds = List.of(-1L);
		}

		List<String> statuses = new ArrayList<>();
		if (leaveEntitlementEmployeeDto.getLeaveRequestStatus() != null) {
			statuses = leaveEntitlementEmployeeDto.getLeaveRequestStatus().stream().map(Enum::name).toList();
		}

		Pageable pageable = PageRequest.of(leaveEntitlementEmployeeDto.getPage(), leaveEntitlementEmployeeDto.getSize(),
				Sort.by(Sort.Direction.ASC, String.valueOf(leaveEntitlementEmployeeDto.getSortKey())));

		Page<EmployeeLeaveRequestReportQueryDto> leaveRequestPage = leaveRequestDao
			.generateLeaveRequestDetailedReportWithPagination(leaveTypeIds, cycleStartDay, cycleEndDay,
					leaveEntitlementEmployeeDto.getJobFamilyId(), leaveEntitlementEmployeeDto.getTeamId(), statuses,
					pageable);

		PageDto pageDto = new PageDto();
		pageDto.setItems(leaveRequestPage.getContent());
		pageDto.setCurrentPage(leaveRequestPage.getNumber());
		pageDto.setTotalItems(leaveRequestPage.getTotalElements());
		pageDto.setTotalPages(leaveRequestPage.getTotalPages());

		log.info("getLeaveRequestsByLeaveTypeJobRoleTeam: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	private List<Long> getValidatedLeaveTypes(List<Long> leaveTypeIds) {
		if (leaveTypeIds != null && !leaveTypeIds.isEmpty() && leaveTypeIds.getFirst() == -1) {
			return getLeaveTypes(leaveTypeIds).stream().map(LeaveType::getTypeId).toList();
		}
		return leaveTypeIds;
	}

	private void validateTeam(Long teamId) {
		if (teamId != null && teamId != -1) {
			boolean teamExists = teamDao.existsByTeamIdAndIsActive(teamId, true);
			if (!teamExists) {
				throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND);
			}
		}
	}

}
