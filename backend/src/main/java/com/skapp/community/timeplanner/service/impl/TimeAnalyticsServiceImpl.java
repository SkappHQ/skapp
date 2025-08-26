package com.skapp.community.timeplanner.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.mapper.CommonMapper;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.response.HolidayResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeTeamDao;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import com.skapp.community.timeplanner.constant.TimeMessageConstant;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.payload.projection.TimeRecordTrendDto;
import com.skapp.community.timeplanner.payload.request.AttendanceDashboardSummaryFilterDto;
import com.skapp.community.timeplanner.payload.request.AverageHoursWorkedTrendFilterDto;
import com.skapp.community.timeplanner.payload.request.ClockInClockOutTrendFilterDto;
import com.skapp.community.timeplanner.payload.request.ClockInSummaryFilterDto;
import com.skapp.community.timeplanner.payload.request.LateArrivalTrendFilterDto;
import com.skapp.community.timeplanner.payload.request.TimeBlockDto;
import com.skapp.community.timeplanner.payload.response.ClockInSummaryLeaveRequestResponseDto;
import com.skapp.community.timeplanner.payload.response.ClockInSummaryResponseDto;
import com.skapp.community.timeplanner.payload.response.UtilizationPercentageDto;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import com.skapp.community.timeplanner.repository.TimeRecordDao;
import com.skapp.community.timeplanner.service.AttendanceConfigService;
import com.skapp.community.timeplanner.service.TimeAnalyticsService;
import com.skapp.community.timeplanner.service.TimeService;
import com.skapp.community.timeplanner.type.ClockInType;
import com.skapp.community.timeplanner.type.RecordType;
import com.skapp.community.timeplanner.type.TrendPeriod;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Month;
import java.time.Year;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;

import static com.skapp.community.common.constant.CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND;
import static com.skapp.community.timeplanner.constant.TimeMessageConstant.TIME_ERROR_MANAGER_OR_ABOVE_PERMISSIONS_REQUIRED;
import static com.skapp.community.timeplanner.type.AttendanceConfigType.CLOCK_IN_ON_LEAVE_DAYS;

@Service
@Slf4j
@RequiredArgsConstructor
public class TimeAnalyticsServiceImpl implements TimeAnalyticsService {

	private final TimeRecordDao timeRecordDao;

	private final TimeConfigDao timeConfigDao;

	private final TeamDao teamDao;

	private final UserService userService;

	private final LeaveRequestDao leaveRequestDao;

	private final EmployeeTeamDao employeeTeamDao;

	private final EmployeeDao employeeDao;

	private final HolidayDao holidayDao;

	private final LeaveMapper leaveMapper;

	private final CommonMapper commonMapper;

	private final PeopleMapper peopleMapper;

	private final TimeService timeService;

	private final AttendanceConfigService attendanceConfigService;

	private final OrganizationService organizationService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getClockInClockOutTrend(ClockInClockOutTrendFilterDto filterDto) {
		log.info("getClockInClockOutTrend: execution started");
		validateClockInClockOutFilter(filterDto);
		validateAndFilterTeams(filterDto.getTeams());

		List<TimeRecordTrendDto> trend = getTrendBasedOnRecordType(filterDto);
		TreeMap<String, Integer> sortedResponseMap = trend.stream()
			.collect(Collectors.toMap(TimeRecordTrendDto::getSlot, TimeRecordTrendDto::getCount,
					(oldValue, newValue) -> oldValue, TreeMap::new));

		log.info("getClockInClockOutTrend: execution ended successfully with result size: {}",
				sortedResponseMap.size());
		return new ResponseEntityDto(false, sortedResponseMap);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto lateArrivalTrend(LateArrivalTrendFilterDto filterDto) {
		log.info("lateArrivalTrend: execution started");

		validateAndFilterTeams(filterDto.getTeams());
		List<TimeRecord> timeRecords = getTimeRecords(filterDto.getTeams());

		List<TimeRecord> lateArrivals = timeRecords.stream().filter(this::isLateArrival).toList();

		Map<String, Long> lateArrivalCount = filterDto.getTrendPeriod().equals(TrendPeriod.MONTHLY)
				? calculateMonthlyLateArrivalCount(lateArrivals) : calculateWeeklyLateArrivalCount(lateArrivals);

		log.info("lateArrivalTrend: execution ended");
		return new ResponseEntityDto(false, lateArrivalCount);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto averageHoursWorkedTrend(AverageHoursWorkedTrendFilterDto filterDto) {
		log.info("averageHoursWorkedTrend: execution started");

		if (filterDto.getMonth() == null) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_MONTH_REQUIRED);
		}

		validateAndFilterTeams(filterDto.getTeams());
		List<TimeRecord> timeRecords = getTimeRecordsForMonth(filterDto);

		Map<LocalDate, Double> dailyWorkedHours = timeRecords.stream()
			.collect(Collectors.groupingBy(TimeRecord::getDate, Collectors.summingDouble(TimeRecord::getWorkedHours)));

		Map<String, Double> dailyAverageHours = calculateDailyAverageHoursForTeam(dailyWorkedHours,
				filterDto.getMonth(), filterDto.getTeams());

		log.info("averageHoursWorkedTrend: execution ended successfully");
		return new ResponseEntityDto(false, dailyAverageHours);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto attendanceDashboardSummary(AttendanceDashboardSummaryFilterDto filterDto) {
		log.info("attendanceDashboardSummary: execution started");

		validateAndFilterTeams(filterDto.getTeams());
		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();

		if (isHolidayOrNoTimeConfig(currentDate)) {
			return buildEmptyDashboardSummary();
		}

		List<TimeRecord> timeRecords = getTimeRecordsForDate(filterDto.getTeams(), currentDate);
		long totalEmployeeCount = getTotalEmployeeCount(filterDto.getTeams(), currentDate);

		long actualClockIns = timeRecords.stream().filter(timeRecord -> timeRecord.getClockInTime() != null).count();
		long lateArrivals = timeRecords.stream().filter(this::isLateArrival).count();

		Map<String, Object> dashboardSummary = buildDashboardSummary(actualClockIns, totalEmployeeCount, lateArrivals);

		log.info("attendanceDashboardSummary: execution ended successfully");
		return new ResponseEntityDto(false, dashboardSummary);
	}

	@Override
	public ResponseEntityDto clockInSummary(ClockInSummaryFilterDto clockInSummaryFilterDto) {
		log.info("clockInSummary: execution started");
		validateAndFilterTeams(clockInSummaryFilterDto.getTeams());
		LocalDate date = clockInSummaryFilterDto.getDate();

		if (clockInSummaryFilterDto.getClockInType() == null) {
			clockInSummaryFilterDto.setClockInType(List.of(ClockInType.ALL_CLOCK_INS));
		}

		if (date == null) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_DATE_REQUIRED);
		}

		if (clockInSummaryFilterDto.getTeams() == null || clockInSummaryFilterDto.getTeams().isEmpty()) {
			clockInSummaryFilterDto.setTeams(List.of(-1L));
		}

		User currentUser = userService.getCurrentUser();
		List<Employee> employees = employeeTeamDao.getEmployeesByTeamIds(clockInSummaryFilterDto.getSearchKeyword(),
				clockInSummaryFilterDto.getTeams(), clockInSummaryFilterDto.getClockInType(), date,
				currentUser.getUserId());

		List<ClockInSummaryResponseDto> clockInSummaryResponseDtos = employees.stream()
			.map(employee -> buildClockInSummaryResponse(clockInSummaryFilterDto, employee))
			.filter(Optional::isPresent)
			.map(Optional::get)
			.toList();

		log.info("clockInSummary: execution ended successfully with result size: {}",
				clockInSummaryResponseDtos.size());
		return new ResponseEntityDto(false, clockInSummaryResponseDtos);
	}

	@Override
	public ResponseEntityDto getIndividualWorkUtilization(Long id) {
		User currentUser = userService.getCurrentUser();
		log.info("getIndividualWorkUtilizationByAdmin: execution started by {}", currentUser.getUserId());

		boolean isAttendanceAdminOrManager = currentUser.getEmployee()
			.getEmployeeRole()
			.getAttendanceRole()
			.equals(Role.ATTENDANCE_ADMIN)
				|| currentUser.getEmployee().getEmployeeRole().getAttendanceRole().equals(Role.ATTENDANCE_MANAGER);
		if (!isAttendanceAdminOrManager) {
			throw new ModuleException(TIME_ERROR_MANAGER_OR_ABOVE_PERMISSIONS_REQUIRED);
		}

		Optional<Employee> employeeOpt = employeeDao.findById(id);
		if (employeeOpt.isEmpty()) {
			throw new ModuleException(COMMON_ERROR_USER_NOT_FOUND);
		}

		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<LocalDate> holidays = holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();

		UtilizationPercentageDto utilizationInfo = timeService
			.calculateWorkTimeUtilization(List.of(employeeOpt.get().getEmployeeId()), timeConfigs, holidays);

		log.info("getIndividualWorkUtilizationByAdmin: execution ended {}", currentUser.getUserId());
		return new ResponseEntityDto(false, utilizationInfo);
	}

	@Override
	public ResponseEntityDto averageEmployeeHoursWorkedTrend(
			AverageHoursWorkedTrendFilterDto averageHoursWorkedTrendFilterDto, Long employeeId) {
		log.info("averageEmployeeHoursWorkedTrend: execution started");

		if (averageHoursWorkedTrendFilterDto.getMonth() == null) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_MONTH_REQUIRED);
		}

		List<TimeRecord> timeRecords = timeRecordDao.getTimeRecordsByEmployeeAndMonth(employeeId,
				averageHoursWorkedTrendFilterDto.getMonth());

		Map<LocalDate, Double> dailyWorkedHours = timeRecords.stream()
			.collect(Collectors.groupingBy(TimeRecord::getDate, Collectors.summingDouble(TimeRecord::getWorkedHours)));

		Map<String, Double> dailyAverageHours = calculateDailyAverageHoursForEmployee(dailyWorkedHours,
				averageHoursWorkedTrendFilterDto.getMonth());

		log.info("averageEmployeeHoursWorkedTrend: execution ended successfully");
		return new ResponseEntityDto(false, dailyAverageHours);
	}

	private Optional<ClockInSummaryResponseDto> buildClockInSummaryResponse(ClockInSummaryFilterDto filterDto,
			Employee employee) {

		if (employee.getAccountStatus().equals(AccountStatus.PENDING)) {
			return Optional.empty();
		}

		List<LeaveRequest> leaveRequestsList = leaveRequestDao
			.findLeaveRequestsForTodayByUser(DateTimeUtils.getCurrentUtcDate(), employee.getEmployeeId());

		boolean clockInOnLeaveDaysStatus = attendanceConfigService.getAttendanceConfigByType(CLOCK_IN_ON_LEAVE_DAYS);

		if (!clockInOnLeaveDaysStatus && !leaveRequestsList.isEmpty()) {
			return Optional.empty();
		}

		if (filterDto.getClockInType().contains(ClockInType.ALL_CLOCK_INS) || filterDto.getClockInType().isEmpty()) {
			return createClockInSummaryResponse(filterDto, employee);
		}

		TimeRecord timeRecord = timeRecordDao.findByDateAndEmployee(filterDto.getDate(), employee);

		if (filterDto.getClockInType().contains(ClockInType.LATE_CLOCK_INS)
				&& filterDto.getClockInType().contains(ClockInType.NOT_CLOCKED_INS) && timeRecord != null
				&& !isLateArrival(timeRecord)) {
			return Optional.empty();
		}

		if (filterDto.getClockInType().contains(ClockInType.LATE_CLOCK_INS)
				&& !filterDto.getClockInType().contains(ClockInType.NOT_CLOCKED_INS)
				&& (timeRecord == null || !isLateArrival(timeRecord))) {
			return Optional.empty();
		}

		return createClockInSummaryResponse(filterDto, employee);
	}

	private Optional<ClockInSummaryResponseDto> createClockInSummaryResponse(ClockInSummaryFilterDto filterDto,
			Employee employee) {
		TimeRecord timeRecord = timeRecordDao.findByDateAndEmployee(filterDto.getDate(), employee);
		ClockInSummaryResponseDto responseDto = new ClockInSummaryResponseDto();
		responseDto.setEmployee(peopleMapper.employeeToEmployeeBasicDetailsResponseDto(employee));
		responseDto.setIsLateArrival(timeRecord != null && isLateArrival(timeRecord));

		if (timeRecord != null) {
			responseDto.setTimeRecordId(timeRecord.getTimeRecordId());
			responseDto.setClockInTime(timeRecord.getClockInTime() != null
					? DateTimeUtils.epochMillisToAmPmString(timeRecord.getClockInTime()) : null);
			responseDto.setClockOutTime(timeRecord.getClockOutTime() != null
					? DateTimeUtils.epochMillisToAmPmString(timeRecord.getClockOutTime()) : null);
			responseDto.setWorkedHours(formatWorkedHours(timeRecord.getWorkedHours()));
		}

		responseDto.setHoliday(getHoliday(filterDto.getDate()));
		responseDto.setLeave(getLeaveRequest(employee, filterDto.getDate()));

		return Optional.of(responseDto);
	}

	private String formatWorkedHours(float hours) {
		int hrs = (int) hours;
		int minutes = Math.round((hours - hrs) * 60);
		return String.format("%dh %02dm", hrs, minutes);
	}

	private HolidayResponseDto getHoliday(LocalDate date) {
		Holiday holiday = holidayDao.findByIsActiveTrueAndDate(date);
		return holiday != null ? commonMapper.holidayToHolidayResponseDto(holiday) : null;
	}

	private ClockInSummaryLeaveRequestResponseDto getLeaveRequest(Employee employee, LocalDate date) {
		LeaveRequest leaveRequest = leaveRequestDao.findByEmployeeAndDate(employee.getEmployeeId(), date);
		return leaveRequest != null ? leaveMapper.leaveRequestToClockInSummaryLeaveRequestResponseDto(leaveRequest)
				: null;
	}

	private void validateClockInClockOutFilter(ClockInClockOutTrendFilterDto filterDto) {
		if (filterDto.getDate() == null) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_DATE_REQUIRED);
		}

		if (filterDto.getRecordType() == null) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_RECORD_TYPE_REQUIRED);
		}

		if (filterDto.getTimeOffset() == null || filterDto.getTimeOffset().isEmpty()) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_TIME_OFFSET_REQUIRED);
		}
	}

	private void validateAndFilterTeams(List<Long> teamIds) {
		if (teamIds == null || (teamIds.size() == 1 && teamIds.contains(-1L))) {
			return;
		}

		User currentUser = userService.getCurrentUser();
		List<Team> teams = teamDao.findByTeamIdIn(teamIds);
		boolean isSuperAdminOrAttendanceAdmin = isUserSuperAdminOrAttendanceAdmin(currentUser);

		PeopleUtil.validateTeamsExist(teamIds, teams);
		if (!isSuperAdminOrAttendanceAdmin) {
			PeopleUtil.validateUserIsSupervisor(teams, currentUser);
		}
	}

	private boolean isUserSuperAdminOrAttendanceAdmin(User user) {
		EmployeeRole role = user.getEmployee().getEmployeeRole();
		return role.getIsSuperAdmin() || Role.ATTENDANCE_ADMIN.equals(role.getAttendanceRole());
	}

	private List<TimeRecord> getTimeRecords(List<Long> teamIds) {
		return teamIds == null || (teamIds.size() == 1 && teamIds.contains(-1L)) ? timeRecordDao.findAll()
				: timeRecordDao.getTimeRecordsByTeam(teamIds);
	}

	private boolean isLateArrival(TimeRecord timeRecord) {
		TimeConfig timeConfig = timeConfigDao.findByDay(timeRecord.getDay());
		if (timeConfig == null)
			return false;

		ZoneId orgTimeZone = ZoneId.of(organizationService.getOrganizationTimeZone());
		LocalTime utcTime = DateTimeUtils.epochMillisToUtcLocalTime(timeRecord.getClockInTime());

		ZonedDateTime orgDateTime = ZonedDateTime.of(LocalDate.now(orgTimeZone), utcTime, ZoneOffset.UTC)
			.withZoneSameInstant(orgTimeZone);

		LocalTime recordStartTime = orgDateTime.toLocalTime();
		LocalTime lateThreshold = LocalTime.of(timeConfig.getStartHour(), timeConfig.getStartMinute());

		LeaveRequest leaveRequest = leaveRequestDao.findByEmployeeAndDate(timeRecord.getEmployee().getEmployeeId(),
				timeRecord.getDate());
		return isLateArrivalBasedOnLeave(leaveRequest, recordStartTime, timeConfig, lateThreshold);
	}

	private boolean isLateArrivalBasedOnLeave(LeaveRequest leaveRequest, LocalTime recordStartTime,
			TimeConfig timeConfig, LocalTime lateThreshold) {
		if (leaveRequest != null) {
			if (leaveRequest.getLeaveState() == LeaveState.FULLDAY)
				return false;
			if (leaveRequest.getLeaveState() == LeaveState.HALFDAY_MORNING) {
				TimeBlockDto timeBlockDto = processTimeBlocks(timeConfig.getTimeBlocks());
				LocalTime adjustedLateThreshold = lateThreshold
					.plusHours((long) Double.parseDouble(timeBlockDto.getMorningHours()));
				return recordStartTime.isAfter(adjustedLateThreshold);
			}
		}
		return recordStartTime.isAfter(lateThreshold);
	}

	private boolean isHolidayOrNoTimeConfig(LocalDate date) {
		return timeConfigDao.findByDay(date.getDayOfWeek()) == null
				|| holidayDao.findByIsActiveTrueAndDate(date) != null;
	}

	private Map<String, Object> buildDashboardSummary(long actualClockIns, long expectedClockIns, long lateArrivals) {
		Map<String, Object> summary = new LinkedHashMap<>();
		summary.put("clockIns", Map.of("actualClockIns", actualClockIns, "expectedClockIns", expectedClockIns));
		summary.put("lateArrivals", Map.of("lateArrivalCount", lateArrivals));
		return summary;
	}

	private ResponseEntityDto buildEmptyDashboardSummary() {
		return new ResponseEntityDto(false, Map.of("clockIns", Map.of("actualClockIns", 0L, "expectedClockIns", 0L),
				"lateArrivals", Map.of("lateArrivalCount", 0L)));
	}

	private List<TimeRecord> getTimeRecordsForMonth(AverageHoursWorkedTrendFilterDto filterDto) {
		User currentUser = userService.getCurrentUser();
		return timeRecordDao.getTimeRecordsByTeamAndMonth(filterDto.getTeams(), filterDto.getMonth(),
				currentUser.getUserId());
	}

	private List<TimeRecord> getTimeRecordsForDate(List<Long> teamIds, LocalDate date) {
		User currentUser = userService.getCurrentUser();
		return timeRecordDao.getTimeRecordsByTeamAndDate(teamIds, date, currentUser.getUserId());
	}

	private long getTotalEmployeeCount(List<Long> teamIds, LocalDate date) {
		User currentUser = userService.getCurrentUser();
		return employeeTeamDao.countAvailableEmployeesByTeamIdsAndDate(teamIds, date, currentUser.getUserId());
	}

	private Map<String, Double> calculateDailyAverageHoursForTeam(Map<LocalDate, Double> dailyWorkedHours,
			Month selectedMonth, List<Long> teamIds) {
		Map<String, Double> dailyAverageHours = new LinkedHashMap<>();
		LocalDate startOfMonth = LocalDate.of(Year.now().getValue(), selectedMonth, 1);
		LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());

		for (LocalDate date = startOfMonth; !date.isAfter(endOfMonth); date = date.plusDays(1)) {
			long totalEmployeeCount = getTotalEmployeeCount(teamIds, date);

			double totalWorkedHours = dailyWorkedHours.getOrDefault(date, 0.0);
			double averageHoursWorked = totalEmployeeCount > 0 ? totalWorkedHours / totalEmployeeCount : 0;
			String formattedDate = date.getDayOfMonth() + DateTimeUtils.getDayOfMonthSuffix(date.getDayOfMonth());
			dailyAverageHours.put(formattedDate, averageHoursWorked);
		}

		return dailyAverageHours;
	}

	private Map<String, Double> calculateDailyAverageHoursForEmployee(Map<LocalDate, Double> dailyWorkedHours,
			Month selectedMonth) {
		Map<String, Double> dailyAverageHours = new LinkedHashMap<>();
		int year = Year.now().getValue();
		int daysInMonth = selectedMonth.length(Year.isLeap(year));
		for (int day = 1; day <= daysInMonth; day++) {
			LocalDate date = LocalDate.of(year, selectedMonth, day);
			String formattedDate = day + DateTimeUtils.getDayOfMonthSuffix(day);
			dailyAverageHours.put(formattedDate, dailyWorkedHours.getOrDefault(date, 0.0));
		}
		return dailyAverageHours;
	}

	private Map<String, Long> calculateWeeklyLateArrivalCount(List<TimeRecord> lateArrivals) {
		Map<String, Long> weeklyCount = new LinkedHashMap<>();
		LocalDate currentWeekStart = LocalDate.of(Year.now().getValue(), Month.JANUARY, 1);

		while (currentWeekStart.getYear() == Year.now().getValue()) {
			LocalDate currentWeekEnd = currentWeekStart.plusDays(6);
			String weekLabel = formatWeekRange(currentWeekStart, currentWeekEnd);

			LocalDate finalCurrentWeekStart = currentWeekStart;
			long count = lateArrivals.stream().filter(timeRecord -> {
				LocalDate slotDate = DateTimeUtils.epochMillisToUtcLocalDate(timeRecord.getClockInTime());
				return !slotDate.isBefore(finalCurrentWeekStart) && !slotDate.isAfter(currentWeekEnd);
			}).count();

			weeklyCount.put(weekLabel, count);
			currentWeekStart = currentWeekEnd.plusDays(1);
		}

		return weeklyCount;
	}

	private Map<String, Long> calculateMonthlyLateArrivalCount(List<TimeRecord> lateArrivals) {
		Map<String, Long> monthlyCount = new LinkedHashMap<>();
		LocalDate startOfMonth = LocalDate.of(Year.now().getValue(), Month.JANUARY, 1);

		while (startOfMonth.getYear() == Year.now().getValue()) {
			LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
			String monthLabel = startOfMonth.format(DateTimeFormatter.ofPattern("MMM"));

			LocalDate finalStartOfMonth = startOfMonth;
			long count = lateArrivals.stream().filter(timeRecord -> {
				LocalDate slotDate = DateTimeUtils.epochMillisToUtcLocalDate(timeRecord.getClockInTime());
				return !slotDate.isBefore(finalStartOfMonth) && !slotDate.isAfter(endOfMonth);
			}).count();

			monthlyCount.put(monthLabel, count);
			startOfMonth = startOfMonth.plusMonths(1);
		}

		return monthlyCount;
	}

	private String formatWeekRange(LocalDate start, LocalDate end) {
		DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("dd");
		DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");

		if (start.getMonth() == end.getMonth()) {
			return start.format(dayFormatter) + " - " + end.format(dayFormatter) + " " + start.format(monthFormatter);
		}
		else {
			return start.format(dayFormatter) + " " + start.format(monthFormatter) + " - " + end.format(dayFormatter)
					+ " " + end.format(monthFormatter);
		}
	}

	private TimeBlockDto processTimeBlocks(JsonNode timeBlocks) {
		TimeBlockDto timeBlockDto = new TimeBlockDto();

		if (timeBlocks.isArray() && !timeBlocks.isEmpty()) {
			for (JsonNode block : timeBlocks) {
				if (!block.has("timeBlock") || !block.has("hours")) {
					throw new ModuleException(TimeMessageConstant.TIME_ERROR_INVALID_TIME_BLOCKS);
				}

				String timeBlock = block.get("timeBlock").asText();
				String hours = block.get("hours").asText();

				if ("MORNING_HOURS".equals(timeBlock)) {
					timeBlockDto.setMorningTimeBlock(timeBlock);
					timeBlockDto.setMorningHours(hours);
				}
				else if ("EVENING_HOURS".equals(timeBlock)) {
					timeBlockDto.setEveningTimeBlock(timeBlock);
					timeBlockDto.setEveningHours(hours);
				}
			}
		}
		else {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_INVALID_TIME_BLOCKS);
		}

		return timeBlockDto;
	}

	private List<TimeRecordTrendDto> getTrendBasedOnRecordType(ClockInClockOutTrendFilterDto filterDto) {
		RecordType recordType = filterDto.getRecordType();
		List<Long> teamIds = filterDto.getTeams();
		String timeOffset = filterDto.getTimeOffset();

		return recordType.equals(RecordType.CLOCK_IN)
				? timeRecordDao.getEmployeeClockInTrend(teamIds, timeOffset, filterDto.getDate())
				: timeRecordDao.getEmployeeClockOutTrend(teamIds, timeOffset, filterDto.getDate());
	}

}
