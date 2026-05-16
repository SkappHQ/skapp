package com.skapp.community.timeplanner.service.impl;

import com.skapp.community.common.constant.CommonConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.mapper.CommonMapper;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.model.LeaveRequestEntitlement;
import com.skapp.community.leaveplanner.payload.LeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.request.EmployeesOnLeavePeriodFilterDto;
import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import com.skapp.community.leaveplanner.repository.LeaveEntitlementDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestEntitlementDao;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.request.EmployeeTimeRequestFilterDto;
import com.skapp.community.peopleplanner.payload.request.ManagerEmployeeLogFilterDto;
import com.skapp.community.peopleplanner.payload.response.HolidayResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import com.skapp.community.peopleplanner.type.RequestStatus;
import com.skapp.community.peopleplanner.type.RequestType;
import com.skapp.community.timeplanner.constant.TimeMessageConstant;
import com.skapp.community.timeplanner.mapper.TimeMapper;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.model.TimeRequest;
import com.skapp.community.timeplanner.model.TimeSlot;
import com.skapp.community.timeplanner.payload.projection.EmployeeWorkHours;
import com.skapp.community.timeplanner.payload.projection.TimeRecordsByEmployeesDto;
import com.skapp.community.timeplanner.payload.request.AddTimeRecordDto;
import com.skapp.community.timeplanner.payload.request.AttendanceSummaryDto;
import com.skapp.community.timeplanner.payload.request.EditTimeRequestDto;
import com.skapp.community.timeplanner.payload.request.EmployeeAttendanceSummaryFilterDto;
import com.skapp.community.timeplanner.payload.request.IndividualWorkHourFilterDto;
import com.skapp.community.timeplanner.payload.request.ManagerAttendanceSummaryFilterDto;
import com.skapp.community.timeplanner.payload.request.ManagerTimeRecordFilterDto;
import com.skapp.community.timeplanner.payload.request.ManagerTimeRequestFilterDto;
import com.skapp.community.timeplanner.payload.request.ManagerTimeRequestResponseDto;
import com.skapp.community.timeplanner.payload.request.ManualEntryRequestDto;
import com.skapp.community.timeplanner.payload.request.TeamTimeRecordFilterDto;
import com.skapp.community.timeplanner.payload.request.TimeConfigDto;
import com.skapp.community.timeplanner.payload.request.TimeRecordFilterDto;
import com.skapp.community.timeplanner.payload.request.TimeRecordsResponseDto;
import com.skapp.community.timeplanner.payload.request.TimeRequestAvailabilityRequestDto;
import com.skapp.community.timeplanner.payload.request.TimeRequestDto;
import com.skapp.community.timeplanner.payload.request.TimeRequestManagerPatchDto;
import com.skapp.community.timeplanner.payload.request.TimeSlotFilterDto;
import com.skapp.community.timeplanner.payload.request.UpdateIncompleteTimeRecordsRequestDto;
import com.skapp.community.timeplanner.payload.request.UpdateTimeRequestsFilterDto;
import com.skapp.community.timeplanner.payload.response.ActiveTimeSlotResponseDto;
import com.skapp.community.timeplanner.payload.response.AttendanceSummaryResponseDto;
import com.skapp.community.timeplanner.payload.response.EmployeeDailyTimeRecordsResponseDto;
import com.skapp.community.timeplanner.payload.response.EmployeeTimeRequestResponseDto;
import com.skapp.community.timeplanner.payload.response.IndividualWorkHoursResponseDto;
import com.skapp.community.timeplanner.payload.response.ManagerEmployeeDailyRecordsResponseDto;
import com.skapp.community.timeplanner.payload.response.PendingTimeRequestsCountDto;
import com.skapp.community.timeplanner.payload.response.TeamTimeRecordSummaryResponseDto;
import com.skapp.community.timeplanner.payload.response.TimeConfigResponseDto;
import com.skapp.community.timeplanner.payload.response.TimeRecordChipResponseDto;
import com.skapp.community.timeplanner.payload.response.TimeRecordsSummary;
import com.skapp.community.timeplanner.payload.response.TimeRequestAvailabilityResponseDto;
import com.skapp.community.timeplanner.payload.response.TimeSheetSummaryData;
import com.skapp.community.timeplanner.payload.response.UtilizationPercentageDto;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import com.skapp.community.timeplanner.repository.TimeRecordDao;
import com.skapp.community.timeplanner.repository.TimeRequestDao;
import com.skapp.community.timeplanner.repository.TimeSlotDao;
import com.skapp.community.timeplanner.repository.projection.EmployeeTimeRecord;
import com.skapp.community.timeplanner.service.AttendanceConfigService;
import com.skapp.community.timeplanner.service.AttendanceNotificationService;
import com.skapp.community.timeplanner.service.TimeEmailService;
import com.skapp.community.timeplanner.service.TimeService;
import com.skapp.community.timeplanner.type.AttendanceConfigType;
import com.skapp.community.timeplanner.type.RecordType;
import com.skapp.community.timeplanner.type.SlotType;
import com.skapp.community.timeplanner.type.TimeBlocks;
import com.skapp.community.timeplanner.type.TimeConfigFieldName;
import com.skapp.community.timeplanner.type.TimeRecordActionTypes;
import com.skapp.community.timeplanner.util.TimeUtil;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

import java.text.SimpleDateFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.chrono.ChronoLocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import static com.skapp.community.common.util.DateTimeUtils.MILLISECONDS_IN_AN_HOUR;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimeServiceImpl implements TimeService {

	private final TimeConfigDao timeConfigDao;

	private final JsonMapper mapper;

	private final MessageUtil messageUtil;

	protected final UserService userService;

	protected final TimeRecordDao timeRecordDao;

	private final TimeSlotDao timeSlotDao;

	protected final AttendanceConfigService attendanceConfigService;

	private final LeaveRequestDao leaveRequestDao;

	private final HolidayDao holidayDao;

	private final EmployeeDao employeeDao;

	private final PeopleMapper peopleMapper;

	private final LeaveMapper leaveMapper;

	private final TimeRequestDao timeRequestDao;

	private final TeamDao teamDao;

	private final TimeMapper timeMapper;

	private final CommonMapper commonMapper;

	private final TimeEmailService timeEmailService;

	private final PageTransformer pageTransformer;

	private final EmployeeManagerDao employeeManagerDao;

	private final AttendanceNotificationService attendanceNotificationService;

	private final LeaveRequestEntitlementDao leaveRequestEntitlementDao;

	private final LeaveEntitlementDao leaveEntitlementDao;

	private final OrganizationService organizationService;

	public static JsonNode createTimeConfigJsonNode(Map<String, Float> hoursMap) {
		ObjectMapper mapper = new ObjectMapper();
		ArrayNode timeBlocksNode = mapper.createArrayNode();

		for (Map.Entry<String, Float> entry : hoursMap.entrySet()) {
			ObjectNode block = mapper.createObjectNode();
			block.put(TimeConfigFieldName.TIME_BLOCK.getFieldName(), entry.getKey());
			block.put(TimeConfigFieldName.HOURS.getFieldName(), entry.getValue());
			timeBlocksNode.add(block);
		}

		return timeBlocksNode;
	}

	@Override
	public ResponseEntityDto updateTimeConfigs(TimeConfigDto timeConfigDto) {
		log.info("updateTimeConfigs : execution started");
		List<TimeConfig> currentTimeConfigs = timeConfigDao.findAll();

		timeConfigDto.getDayCapacities().forEach(timeConfig -> {
			List<TimeConfig> timeConfigList = currentTimeConfigs.stream()
				.filter(current -> current.getDay().equals(timeConfig.day()))
				.toList();
			if (timeConfigList.isEmpty()) {
				currentTimeConfigs.add(createTimeConfig(timeConfig));
			}
			else if (timeConfigList.size() == 1) {
				updateTimeConfig(timeConfigList.getFirst(), timeConfig);
			}
			else {
				throw new EntityNotFoundException(
						messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_TIME_CONFIGS_NOT_FOUND));
			}
		});

		setRemovingTimeConfigs(currentTimeConfigs, timeConfigDto.getDayCapacities());

		List<TimeConfig> orgConfig = timeConfigDao.saveAll(currentTimeConfigs);

		log.info("updateTimeConfigs: execution ended");
		return new ResponseEntityDto(false, orgConfig);
	}

	@Override
	public ResponseEntityDto getActiveTimeSlot() {
		User currentUser = userService.getCurrentUser();
		log.info("getActiveTimeSlot: execution started by user: {}", currentUser.getUserId());

		ResponseEntityDto leaveOrHolidayOrNonWorkingDayResponse = checkLeaveOrHolidayOrNonWorkingDay();
		if (leaveOrHolidayOrNonWorkingDayResponse != null) {
			return leaveOrHolidayOrNonWorkingDayResponse;
		}

		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();
		Optional<TimeRecord> timeRecord = timeRecordDao.findByEmployeeAndDate(currentUser.getEmployee(), currentDate);

		if (timeRecord.isPresent()) {
			ActiveTimeSlotResponseDto activeTimeSlotResponseDto = new ActiveTimeSlotResponseDto();
			Optional<TimeSlot> activeTimeSlot = timeSlotDao.findByTimeRecordAndIsActiveRightNow(timeRecord.get(), true);

			if (activeTimeSlot.isEmpty()) {
				log.info("getActiveTimeSlot: no active time slot found for user: {}", currentUser.getUserId());
				if (timeRecord.get().getClockOutTime() != null) {
					LocalDateTime clockOutTimeUtc = DateTimeUtils
						.epochMillisToUtcLocalDateTime(timeRecord.get().getClockOutTime(), null);
					activeTimeSlotResponseDto.setStarTime(clockOutTimeUtc);
					activeTimeSlotResponseDto.setPeriodType(TimeRecordActionTypes.END);
				}
			}
			else {
				LocalDateTime slotStartTimeUtc = DateTimeUtils
					.epochMillisToUtcLocalDateTime(activeTimeSlot.get().getStartTime(), null);
				activeTimeSlotResponseDto.setStarTime(slotStartTimeUtc);
				activeTimeSlotResponseDto.setPeriodType(activeTimeSlot.get().getSlotType() == SlotType.WORK
						? TimeRecordActionTypes.RESUME : TimeRecordActionTypes.PAUSE);
				activeTimeSlotResponseDto.setBreakHours(activeTimeSlot.get().getTimeRecord().getBreakHours());
				activeTimeSlotResponseDto.setWorkHours(activeTimeSlot.get().getTimeRecord().getWorkedHours());
			}
			return new ResponseEntityDto(false, activeTimeSlotResponseDto);
		}
		else {
			log.info("getActiveTimeSlot: no time record found for user: {}", currentUser.getUserId());
			return new ResponseEntityDto();
		}
	}

	@Override
	public ResponseEntityDto getEmployeeAttendanceSummary(
			EmployeeAttendanceSummaryFilterDto employeeAttendanceSummaryFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("getEmployeeTotalWorkBreakHours: execution started by user: {}", currentUser.getUserId());

		Optional<Employee> employeeOptional = employeeDao.findById(currentUser.getUserId());
		if (employeeOptional.isEmpty()) {
			throw new EntityNotFoundException(
					messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND));
		}
		AttendanceSummaryDto attendanceSummaryDto = timeRecordDao.getEmployeeAttendanceSummary(
				List.of(currentUser.getUserId()), employeeAttendanceSummaryFilterDto.getStartDate(),
				employeeAttendanceSummaryFilterDto.getEndDate());
		return new ResponseEntityDto(false,
				new AttendanceSummaryResponseDto(
						TimeUtil.formatHoursAndMinutes(attendanceSummaryDto.getTotalWorkHours()),
						TimeUtil.formatHoursAndMinutes(attendanceSummaryDto.getTotalBreakHours())));
	}

	@Override
	public ResponseEntityDto getEmployeeDailyTimeRecords(TimeRecordFilterDto timeRecordFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("getEmployeeDailyTimeRecords: execution started by user: {}", currentUser.getUserId());

		PageDto pageDto = getEmployeeTimeRecord(timeRecordFilterDto, currentUser.getUserId());
		log.info("getEmployeeDailyTimeRecords: execution ended by user: {}", userService.getCurrentUser());
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	public ResponseEntityDto getEmployeeDailyTimeRecordsByEmployeeId(TimeRecordFilterDto timeRecordFilterDto,
			Long employeeId) {
		User currentUser = userService.getCurrentUser();
		log.info("getEmployeeDailyTimeRecordsByEmployeeId: execution started by user: {}", currentUser.getUserId());

		PageDto pageDto = getEmployeeTimeRecord(timeRecordFilterDto, employeeId);
		log.info("getEmployeeDailyTimeRecordsByEmployeeId: execution ended by user: {}", userService.getCurrentUser());
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	public ResponseEntityDto getPendingTimeRequestsCount() {
		log.info("getPendingTimeRequestsCount: execution started");

		PendingTimeRequestsCountDto pendingTimeRequestsCountDto = new PendingTimeRequestsCountDto();
		Long pendingRequestCount = timeRequestDao
			.countSupervisedPendingTimeRequests(userService.getCurrentUser().getUserId());

		pendingTimeRequestsCountDto.setPendingTimeRequestsCount(pendingRequestCount);

		log.info("getPendingTimeRequestsCount: execution ended");
		return new ResponseEntityDto(false, pendingTimeRequestsCountDto);
	}

	private PageDto getEmployeeTimeRecord(TimeRecordFilterDto timeRecordFilterDto, Long employeeId) {
		LocalDate startDate = timeRecordFilterDto.getStartDate();
		LocalDate endDate = timeRecordFilterDto.getEndDate();

		Optional<Employee> employeeOptional = employeeDao.findById(employeeId);
		if (employeeOptional.isEmpty()) {
			throw new EntityNotFoundException(
					messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND));
		}

		List<Long> employees = List.of(employeeId);
		Long totalItemCount = timeRecordDao.getTotalEmployeesTimeRecordCount(employees, startDate, endDate);

		int pageSize = timeRecordFilterDto.getSize();
		boolean isExport = timeRecordFilterDto.getIsExport();
		if (isExport) {
			pageSize = Math.toIntExact(totalItemCount);
		}

		Pageable pageable = PageRequest.of(timeRecordFilterDto.getPage(), pageSize, timeRecordFilterDto.getSortOrder(),
				timeRecordFilterDto.getSortKey().toString());

		List<EmployeeTimeRecord> timeRecords = timeRecordDao.findEmployeesTimeRecords(employees, startDate, endDate,
				pageable.getPageSize(), pageable.getOffset());

		LeaveRequestFilterDto leaveRequestFilterDto = new LeaveRequestFilterDto();
		leaveRequestFilterDto.setStartDate(timeRecordFilterDto.getStartDate());
		leaveRequestFilterDto.setEndDate(timeRecordFilterDto.getEndDate());

		List<LeaveRequestResponseDto> leaveRequestResponseDtos = findLeaveRequestsByDateRange(leaveRequestFilterDto,
				employeeId);
		List<Holiday> holidays = holidayDao.findAllByIsActiveTrueAndDateBetween(startDate, endDate);
		List<HolidayResponseDto> holidayResponseDtos = peopleMapper.holidaysToHolidayResponseDtoList(holidays);

		List<EmployeeDailyTimeRecordsResponseDto> response = new ArrayList<>();
		for (EmployeeTimeRecord employeeTimeRecord : timeRecords) {
			EmployeeDailyTimeRecordsResponseDto dailyResponseRecord = new EmployeeDailyTimeRecordsResponseDto();

			dailyResponseRecord.setTimeRecordId(employeeTimeRecord.getTimeRecordId());
			dailyResponseRecord.setDate(employeeTimeRecord.getDate());
			dailyResponseRecord.setDay(employeeTimeRecord.getDate().getDayOfWeek());
			dailyResponseRecord.setWorkedHours(employeeTimeRecord.getWorkedHours());
			dailyResponseRecord.setBreakHours(employeeTimeRecord.getBreakHours());

			if (employeeTimeRecord.getTimeSlots() != null) {
				dailyResponseRecord
					.setTimeSlots(mapper.readValue(employeeTimeRecord.getTimeSlots(), new TypeReference<>() {
					}));
			}
			else {
				dailyResponseRecord.setTimeSlots(new ArrayList<>());
			}

			LocalDate currentDate = employeeTimeRecord.getDate();

			Optional<LeaveRequestResponseDto> matchingLeaveRequest = leaveRequestResponseDtos.stream()
				.filter(leaveRequest -> TimeUtil.isDateWithinRange(leaveRequest.getStartDate(),
						leaveRequest.getEndDate(), currentDate))
				.findFirst();
			dailyResponseRecord.setLeaveRequest(matchingLeaveRequest.orElse(null));
			Optional<HolidayResponseDto> matchingHoliday = holidayResponseDtos.stream()
				.filter(holiday -> holiday.getDate().isEqual(currentDate))
				.findFirst();
			dailyResponseRecord.setHoliday(matchingHoliday.orElse(null));

			response.add(dailyResponseRecord);
		}

		PageDto pageDto = new PageDto();
		pageDto.setItems(response);
		pageDto.setTotalItems(totalItemCount);
		pageDto.setTotalPages(timeRecordFilterDto.getSize() == 0 ? 1
				: (int) Math.ceil((double) totalItemCount / (double) timeRecordFilterDto.getSize()));
		pageDto.setCurrentPage(timeRecordFilterDto.getPage());

		return pageDto;
	}

	@Override
	public ResponseEntityDto getAllRequestsOfEmployee(EmployeeTimeRequestFilterDto employeeTimeRequestFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("getAllRequestsOfEmployee: execution started by user: {}", currentUser.getUserId());

		if (Boolean.TRUE.equals(employeeTimeRequestFilterDto.getIsExport()))
			employeeTimeRequestFilterDto.setPageSize(Integer.MAX_VALUE);
		Pageable pageable = PageRequest.of(employeeTimeRequestFilterDto.getPageNumber(),
				employeeTimeRequestFilterDto.getPageSize(), Sort.by(employeeTimeRequestFilterDto.getSortBy(),
						employeeTimeRequestFilterDto.getSortKey().toString()));

		Page<TimeRequest> timeRequests = timeRequestDao.findAllTimeRequestsOnDateByFilters(currentUser.getEmployee(),
				employeeTimeRequestFilterDto, pageable);
		List<EmployeeTimeRequestResponseDto> employeeTimeRequestResponseDtos = timeMapper
			.timeRequestListToTimeRequestResponseDtoList(timeRequests.getContent());

		PageDto response = pageTransformer.transform(timeRequests);
		response.setItems(employeeTimeRequestResponseDtos);

		log.info("getAllRequestsOfEmployee: execution completed");
		return new ResponseEntityDto(false, response);
	}

	@Override
	public ResponseEntityDto getRequestedDateTimeAvailability(TimeRequestAvailabilityRequestDto requestDto) {
		User currentUser = userService.getCurrentUser();
		log.info("getRequestedDateTimeAvailability: execution started by user: {}", currentUser.getUserId());

		TimeRequestAvailabilityResponseDto response = new TimeRequestAvailabilityResponseDto();
		response.setDate(requestDto.getDate());

		List<LeaveRequest> leaveRequests = leaveRequestDao
			.findLeaveRequestAvailabilityForGivenDate(requestDto.getDate(), currentUser.getEmployee().getEmployeeId());
		response.setLeaveRequest(leaveMapper.leaveRequestListToLeaveRequestResponseDtoList(leaveRequests));

		List<Holiday> holidays = holidayDao.findAllByIsActiveTrueAndDateBetween(requestDto.getDate(),
				requestDto.getDate());
		response.setHoliday(peopleMapper.holidaysToHolidayResponseDtoList(holidays));

		TimeSlotFilterDto timeSlotFilterDto = new TimeSlotFilterDto();
		timeSlotFilterDto.setDate(requestDto.getDate());
		timeSlotFilterDto.setEmployeeId(currentUser.getEmployee().getEmployeeId());
		timeSlotFilterDto.setPageSize(Integer.MAX_VALUE);
		List<TimeSlot> timeSlots = timeSlotDao.getTimeSlotsByTimePeriod(timeSlotFilterDto).getContent();

		EmployeeTimeRequestFilterDto timeRequestFilterDto = new EmployeeTimeRequestFilterDto();
		timeRequestFilterDto.setEmployeeId(currentUser.getEmployee().getEmployeeId());
		timeRequestFilterDto.setStatus(List.of(RequestStatus.PENDING));
		timeRequestFilterDto.setDate(requestDto.getDate());
		TimeRequest editTimeRequest = timeRequestDao.findTimeRequestsByOptionalFilters(timeRequestFilterDto).isEmpty()
				? null : timeRequestDao.findTimeRequestsByOptionalFilters(timeRequestFilterDto).getFirst();

		List<TimeRequest> manualTimeRequests = timeRequestDao.findPendingEntryRequestsWithoutTimeRecordId(
				currentUser.getEmployee().getEmployeeId(), requestDto.getStartTime(), requestDto.getEndTime());

		response.setTimeSlotsExists(!timeSlots.isEmpty());
		response.setEditTimeRequests(timeMapper.timeRequestToTimeRequestResponseDto(editTimeRequest));
		response.setManualEntryRequests(timeMapper.timeRequestListToTimeRequestResponseDtoList(manualTimeRequests));

		log.info("getRequestedDateTimeAvailability: execution completed");
		return new ResponseEntityDto(false, response);
	}

	@Override
	public ResponseEntityDto getIncompleteClockOuts() {
		User currentUser = userService.getCurrentUser();
		log.info("getIncompleteClockOuts: execution started by user: {}", currentUser.getUserId());

		LocalDate lastClockInDate = currentUser.getEmployee().getLastClockInDate();

		Optional<TimeRecord> incompleteTimeRecords = Optional.empty();
		if (lastClockInDate != null) {
			incompleteTimeRecords = timeRecordDao.findIncompleteClockoutTimeRecords(lastClockInDate,
					currentUser.getEmployee().getEmployeeId());
		}

		return new ResponseEntityDto(false,
				incompleteTimeRecords.isPresent() && !lastClockInDate.equals(DateTimeUtils.getCurrentUtcDate())
						? timeMapper.timeRecordToTimeRecordResponseDto(incompleteTimeRecords.get())
						: incompleteTimeRecords);
	}

	@Override
	public ResponseEntityDto getDefaultTimeConfigurations() {
		log.info("getDefaultTimeConfigurations: execution started");

		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<TimeConfigResponseDto> newTimeConfigs = new ArrayList<>();
		for (TimeConfig tcm : timeConfigs) {
			if (tcm.getStartHour() == null) {
				tcm.setStartHour(0);
			}
			if (tcm.getStartMinute() == null) {
				tcm.setStartMinute(0);
			}
			TimeConfigResponseDto obj = timeMapper.timeConfigToTimeConfigResponseDto(tcm);
			newTimeConfigs.add(obj);
		}
		List<DayOfWeek> days = List.of(DayOfWeek.values());
		List<TimeConfigResponseDto> sortedTimeConfigs = new ArrayList<>();
		days.forEach(day -> {
			List<TimeConfigResponseDto> timeConfig = newTimeConfigs.stream()
				.filter(tc -> tc.getDay().equals(day))
				.toList();
			if (!timeConfig.isEmpty()) {
				sortedTimeConfigs.add(timeConfig.getFirst());
			}
		});

		log.info("getDefaultTimeConfigurations: execution ended");
		return new ResponseEntityDto(false, sortedTimeConfigs);
	}

	@Override
	@Transactional(propagation = Propagation.REQUIRED)
	public ResponseEntityDto addTimeRecord(AddTimeRecordDto addTimeRecordDto) {
		User currentUser = userService.getCurrentUser();
		log.info("addTimeRecord: execution started by user: {}", currentUser.getUserId());

		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();
		LocalDate timeRecordDate = addTimeRecordDto.getTime().toLocalDate();
		if (timeRecordDate.isAfter(currentDate)) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_CANNOT_ADD_RECORD_FOR_FUTURE);
		}

		long timeToRecordInMillis = DateTimeUtils.localDateTimeToEpochMillis(addTimeRecordDto.getTime());
		if (addTimeRecordDto.getRecordActionType() == TimeRecordActionTypes.START
				|| addTimeRecordDto.getRecordActionType() == TimeRecordActionTypes.END) {
			recordClockInAndClockOut(currentUser, timeToRecordInMillis, addTimeRecordDto.getRecordActionType());
		}
		else if (addTimeRecordDto.getRecordActionType() == TimeRecordActionTypes.RESUME
				|| addTimeRecordDto.getRecordActionType() == TimeRecordActionTypes.PAUSE) {
			Optional<TimeRecord> timeRecord = timeRecordDao.findByEmployeeAndDate(currentUser.getEmployee(),
					DateTimeUtils.toLocalDate(addTimeRecordDto.getTime()));
			if (timeRecord.isPresent()) {
				createTimeSlot(timeRecord.get(), timeToRecordInMillis, addTimeRecordDto.getRecordActionType());
			}
			else {
				log.info("addTimeRecord: no time record found for user: {}", currentUser.getUserId());
				throw new ModuleException(TimeMessageConstant.TIME_ERROR_CLOCK_IN_NOT_EXISTS_FOR_CURRENT_DATE);
			}
		}
		return new ResponseEntityDto(false,
				messageUtil.getMessage(TimeMessageConstant.TIME_SUCCESS_TIME_RECORD_ADDED, new String[] {
						addTimeRecordDto.getTime().toString(), addTimeRecordDto.getRecordActionType().toString() }));
	}

	@Override
	@Transactional
	public ResponseEntityDto editTimeRequest(EditTimeRequestDto timeRequestDto) {
		User currentUser = userService.getCurrentUser();
		log.info("editClockInClockOut: execution started by user: {}", currentUser.getUserId());

		validateRequestParameters(timeRequestDto);

		TimeRecord timeRecord = findTimeRecordForTheRequest(timeRequestDto);
		if (timeRecord != null) {
			validateTimeRecord(timeRecord, timeRequestDto);

			EmployeeTimeRequestFilterDto filterDto = new EmployeeTimeRequestFilterDto();
			filterDto.setRecordId(timeRecord.getTimeRecordId());
			filterDto.setDate(DateTimeUtils.toLocalDate(timeRequestDto.getStartTime()));
			filterDto.setStatus(List.of(RequestStatus.PENDING));
			List<TimeRequest> timeRequestsOnDate = timeRequestDao.findTimeRequestsByOptionalFilters(filterDto);
			if (!timeRequestsOnDate.isEmpty()) {
				throw new ModuleException(TimeMessageConstant.TIME_ERROR_FOUND_OVERLAPPING_REQUESTS);
			}
		}

		TimeRequest timeRequestToSave = timeRequestBuilder(timeRequestDto, currentUser.getEmployee(), timeRecord);
		timeRequestToSave = timeRequestDao.save(timeRequestToSave);

		log.info("editClockInClockOut: execution completed");
		return new ResponseEntityDto(false, timeMapper.timeRequestToTimeRequestResponseDto(timeRequestToSave));
	}

	@Override
	public ResponseEntityDto getIfTimeConfigRemovable(List<DayOfWeek> days) {

		ArrayNode arrayNode = mapper.createArrayNode();
		days.forEach(day -> {
			ObjectNode objectNode = mapper.createObjectNode();

			objectNode.put(day.name(), leaveRequestDao.findAllFutureLeaveRequestsForTheDay(day).isEmpty());
			arrayNode.add(objectNode);
		});
		return new ResponseEntityDto(false, arrayNode);

	}

	@Override
	@Transactional
	public ResponseEntityDto addManualEntryRequest(ManualEntryRequestDto timeRequestDto) {
		User currentUser = userService.getCurrentUser();
		log.info("addManualEntryRequest: execution started by user: {}", currentUser.getUserId());

		if (!employeeManagerDao.existsByEmployee(currentUser.getEmployee())) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_NO_MANAGERS_FOUND);
		}

		validateRequestParameters(timeRequestDto);

		TimeRecord timeRecord = findTimeRecordForTheRequest(timeRequestDto);
		if (timeRecord != null)
			validateTimeRecord(timeRecord, timeRequestDto);

		TimeRequest timeRequestToSave = timeRequestBuilder(timeRequestDto, currentUser.getEmployee(), timeRecord);
		validateTimeRequestToSave(timeRequestToSave);
		timeRequestToSave = timeRequestDao.save(timeRequestToSave);

		boolean attendanceConfigForAutoApproval = attendanceConfigService
			.getAttendanceConfigByType(AttendanceConfigType.AUTO_APPROVAL_FOR_CHANGES);
		if (attendanceConfigForAutoApproval) {
			handleTimeEntryRequestAutoApproval(timeRequestToSave);
		}

		timeEmailService.sendTimeEntryRequestSubmittedEmployeeEmail(timeRequestToSave);
		attendanceNotificationService.sendTimeEntryRequestSubmittedEmployeeNotification(timeRequestToSave);

		timeEmailService.sendReceivedTimeEntryRequestManagerEmail(timeRequestToSave);
		attendanceNotificationService.sendReceivedTimeEntryRequestManagerNotification(timeRequestToSave);

		log.info("addManualEntryRequest: execution completed");
		return new ResponseEntityDto(false, timeMapper.timeRequestToTimeRequestResponseDto(timeRequestToSave));
	}

	@Override
	public ResponseEntityDto updateTimeRequests(UpdateTimeRequestsFilterDto updateTimeRequestsFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("cancelTimeRecords: execution started by user: {}", currentUser.getUserId());

		Optional<TimeRequest> optionalTimeRequest = timeRequestDao
			.findById(updateTimeRequestsFilterDto.getTimeRequestId());
		if (optionalTimeRequest.isPresent()) {
			TimeRequest timeRequest = optionalTimeRequest.get();
			RequestStatus requestStatus = timeRequest.getStatus();
			if (requestStatus.equals(RequestStatus.PENDING)) {
				timeRequest.setStatus(RequestStatus.CANCELLED);
				timeRequestDao.save(timeRequest);

				timeEmailService.sendPendingTimeEntryRequestCancelledEmployeeEmail(timeRequest);
				attendanceNotificationService.sendPendingTimeEntryRequestCancelledEmployeeNotification(timeRequest);

				timeEmailService.sendPendingTimeEntryRequestCancelledManagerEmail(timeRequest);
				attendanceNotificationService.sendPendingTimeEntryRequestCancelledManagerNotification(timeRequest);

				return new ResponseEntityDto(false,
						"Time request " + timeRequest.getTimeRequestId() + " got cancelled");
			}
			else {
				throw new ModuleException(TimeMessageConstant.TIME_ERROR_TIME_REQUEST_CANNOT_EDIT);
			}
		}
		else {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_TIME_REQUEST_NOT_FOUND);
		}
	}

	@Override
	@Transactional
	public ResponseEntityDto updateCurrentUserIncompleteTimeRecords(Long id,
			UpdateIncompleteTimeRecordsRequestDto requestDto) {
		User currentUser = userService.getCurrentUser();
		log.info("clockoutIncompleteTimeRecords: execution started by user: {}", currentUser.getUserId());

		Optional<TimeRecord> timeRecord = timeRecordDao.findById(id);

		if (timeRecord.isEmpty()) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_NO_TIME_RECORD_FOUND,
					new String[] { id.toString() });
		}

		if (!timeRecord.get().getEmployee().getUser().getUserId().equals(currentUser.getUserId())) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_TIME_RECORD_EMPLOYEE_ID_MISMATCH,
					new String[] { id.toString() });
		}

		if (timeRecord.get().isCompleted()) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_TIME_RECORD_COMPLETED,
					new String[] { id.toString() });
		}

		boolean isValid = validateDateTime(timeRecord.get(), requestDto);
		if (!isValid) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_START_END_TIME_DIFFERENT_DATES);
		}

		Long dateInEpochMillis = DateTimeUtils.localDateTimeToEpochMillis(requestDto.getClockOutTime());

		List<TimeSlot> timeSlots = timeSlotDao.findTimeSlotByTimeRecord(timeRecord.get());
		TimeSlot slotToUpdate = timeSlots.getLast();
		slotToUpdate.setEndTime(dateInEpochMillis);
		slotToUpdate.setActiveRightNow(false);
		timeRecord.get().setClockOutTime(dateInEpochMillis);

		updateWorkHours(timeRecord.get(), slotToUpdate, slotToUpdate.getSlotType());
		timeRecord.get().setCompleted(true);

		timeRecordDao.save(timeRecord.get());
		timeSlotDao.save(slotToUpdate);

		return new ResponseEntityDto(false, timeMapper.timeRecordToTimeRecordResponseDto(timeRecord.get()));
	}

	@Override
	@Transactional
	public ResponseEntityDto getManagerAttendanceSummary(
			ManagerAttendanceSummaryFilterDto managerAttendanceSummaryFilterDto) {
		User user = userService.getCurrentUser();
		log.info("getManagerAttendanceSummary: execution started");

		if (managerAttendanceSummaryFilterDto.getTeamIds() == null
				|| managerAttendanceSummaryFilterDto.getTeamIds().isEmpty()) {
			ArrayList<Long> longArrayList = new ArrayList<>();
			longArrayList.add(-1L);
			managerAttendanceSummaryFilterDto.setTeamIds(longArrayList);
		}

		if (managerAttendanceSummaryFilterDto.getStartDate().isAfter(managerAttendanceSummaryFilterDto.getEndDate())) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_START_DATE_END_DATE_NOT_VALID);
		}

		List<Long> teamIds = managerAttendanceSummaryFilterDto.getTeamIds();
		if (teamIds.getFirst() == -1) {
			teamIds = user.getEmployee().getEmployeeRole().getAttendanceRole() == Role.ATTENDANCE_MANAGER
					? teamDao.findLeadingTeamIdsByManagerId(user.getUserId())
					: teamDao.findAllByIsActive(true).stream().map(Team::getTeamId).toList();
		}
		else {
			List<Long> invalidTeams = teamIds.stream()
				.filter(team -> teamDao.findByTeamIdAndIsActive(team, true).isEmpty())
				.toList();
			if (!invalidTeams.isEmpty()) {
				throw new EntityNotFoundException(
						messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND));
			}
		}

		Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);

		List<Long> employeeList = new ArrayList<>();
		if (managerAttendanceSummaryFilterDto.getTeamIds().contains(-1L)) {

			List<Employee> employeePage = teamDao.findEmployeesInManagerLeadingTeams(teamIds, pageable, user)
				.getContent();

			if (!employeePage.isEmpty()) {
				employeePage.forEach(employee -> employeeList.add(employee.getEmployeeId()));
			}

			if (user.getEmployee().getEmployeeRole().getAttendanceRole() == Role.ATTENDANCE_MANAGER) {
				employeeList.addAll(employeeManagerDao.findManagerSupervisingEmployee(user.getUserId()));
			}
		}

		AttendanceSummaryDto attendanceSummaryDto = timeRecordDao.findManagerAssignUsersAttendanceSummary(
				user.getUserId(), teamIds, managerAttendanceSummaryFilterDto.getStartDate(),
				managerAttendanceSummaryFilterDto.getEndDate(), employeeList);

		log.info("getManagerAttendanceSummary: execution ended");
		return new ResponseEntityDto(false,
				new AttendanceSummaryResponseDto(
						TimeUtil.formatHoursAndMinutes(attendanceSummaryDto.getTotalWorkHours()),
						TimeUtil.formatHoursAndMinutes(attendanceSummaryDto.getTotalBreakHours())));
	}

	@Override
	public ResponseEntityDto updateTimeRequestByManager(Long id,
			TimeRequestManagerPatchDto timeRequestManagerPatchDto) {
		User user = userService.getCurrentUser();
		log.info("updateTimeRequestByManager: execution started by user: {}", user.getUserId());

		Optional<TimeRequest> timeRequest = timeRequestDao.findById(id);
		TimeRequest timeRequestResponse;
		if (timeRequest.isEmpty()) {
			log.info("updateTimeRequestByManager: no time request found for user with given id: {}", user.getUserId());
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_NO_TIME_REQUEST_FOUND);
		}

		if (timeRequest.get().getStatus() != RequestStatus.PENDING) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_TIME_REQUEST_CANNOT_EDIT);
		}

		Optional<Employee> employee = employeeDao.findByEmployeeId(timeRequest.get().getEmployee().getEmployeeId());
		if (employee.isEmpty()) {
			log.info("updateTimeRequestByManager: no employee found for user with given id: {}", user.getUserId());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		boolean isManager = timeRequest.get()
			.getEmployee()
			.getEmployeeManagers()
			.stream()
			.anyMatch(employeeManager -> employeeManager.getManager().getUser() == user);

		if (!isManager) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_TIME_REQUEST_MANAGER_MISMATCH);
		}

		if (timeRequest.get().getRequestType().equals(RequestType.EDIT_RECORD_REQUEST))
			timeRequestResponse = handleEditTimeRecordRequests(timeRequest.get(), user, timeRequestManagerPatchDto);
		else {
			timeRequestResponse = handleManualTimeEntryRequests(timeRequest.get(), user, timeRequestManagerPatchDto);
		}

		if (timeRequestResponse != null && timeRequestResponse.getStatus() == RequestStatus.APPROVED) {
			timeEmailService.sendTimeEntryRequestApprovedEmployeeEmail(timeRequestResponse, user);
			attendanceNotificationService.sendTimeEntryRequestApprovedEmployeeNotification(timeRequestResponse, user);
			timeEmailService.sendTimeEntryRequestApprovedOtherManagerEmail(timeRequestResponse, user);
			attendanceNotificationService.sendTimeEntryRequestApprovedOtherManagerNotification(timeRequestResponse,
					user);
		}
		else if (timeRequestResponse != null && timeRequestResponse.getStatus() == RequestStatus.DENIED) {
			timeEmailService.sendTimeEntryRequestDeclinedEmployeeEmail(timeRequestResponse, user);
			attendanceNotificationService.sendTimeEntryRequestDeclinedByManagerEmployeeNotification(timeRequestResponse,
					user);
			timeEmailService.sendTimeEntryRequestDeclinedOtherManagerEmail(timeRequestResponse, user);
			attendanceNotificationService.sendTimeEntryRequestDeclinedOtherManagerNotification(timeRequestResponse,
					user);
		}

		EmployeeTimeRequestResponseDto response = timeMapper.timeRequestToTimeRequestResponseDto(timeRequestResponse);
		return new ResponseEntityDto(false, response);
	}

	@Override
	public TimeRequest handleEditTimeRecordRequests(TimeRequest timeRequest, User currentUser,
			TimeRequestManagerPatchDto timeRequestManagerPatchDto) {
		log.info("handleEditTimeRecordRequests: executing edit time record request method: {}",
				currentUser.getUserId());

		TimeRequest timeRequestResponse = null;
		if (timeRequestManagerPatchDto.getStatus().equals(RequestStatus.DENIED)) {
			timeRequestResponse = deleteTimeRequest(timeRequest);
		}
		else if (timeRequestManagerPatchDto.getStatus().equals(RequestStatus.APPROVED)) {
			log.info("handleEditTimeRecordRequests: executing edit time record request method: {}",
					currentUser.getUserId());
			List<TimeSlot> timeSlots = timeSlotDao.findTimeSlotByTimeRecord(timeRequest.getTimeRecord())
				.stream()
				.sorted((o1, o2) -> (int) (o1.getStartTime() - o2.getStartTime()))
				.toList();
			TimeRecord timeRecord = timeRequest.getTimeRecord();
			List<TimeSlot> timeSlotsToBeDeleted = new ArrayList<>();

			if (timeRequest.getRequestedStartTime() <= timeRequest.getInitialClockIn()) {
				handleExpandClockInClockOut(timeRequest, timeRecord, timeSlots, RecordType.CLOCK_IN);
			}
			else if (timeRequest.getRequestedStartTime() > timeRequest.getInitialClockIn()) {
				handleShrinkClockInClockOut(timeRequest, timeRecord, RecordType.CLOCK_IN, timeSlots,
						timeSlotsToBeDeleted);
			}

			if (timeRequest.getInitialClockOut() == null
					|| timeRequest.getRequestedEndTime() >= timeRequest.getInitialClockOut()) {
				handleExpandClockInClockOut(timeRequest, timeRecord, timeSlots, RecordType.CLOCK_OUT);
			}
			else if (timeRequest.getRequestedEndTime() < timeRequest.getInitialClockOut()) {
				handleShrinkClockInClockOut(timeRequest, timeRecord, RecordType.CLOCK_OUT, timeSlots,
						timeSlotsToBeDeleted);
			}

			float recalculatedWorkHours = 0f;
			float recalculatedBreakHours = 0f;
			for (TimeSlot slot : timeSlots) {
				if (timeSlotsToBeDeleted.contains(slot) || slot.getEndTime() == null)
					continue;
				float hours = (slot.getEndTime() - slot.getStartTime()) / MILLISECONDS_IN_AN_HOUR;
				if (slot.getSlotType() == SlotType.WORK)
					recalculatedWorkHours += hours;
				else if (slot.getSlotType() == SlotType.BREAK)
					recalculatedBreakHours += hours;
			}
			timeRecord.setWorkedHours(recalculatedWorkHours);
			timeRecord.setBreakHours(recalculatedBreakHours);

			timeRequest.setWorkHours(recalculatedWorkHours);
			timeRequest.setBreakHours(recalculatedBreakHours);

			timeSlotDao.saveAll(timeSlots);
			if (!timeSlotsToBeDeleted.isEmpty()) {
				timeSlotDao.deleteAll(timeSlotsToBeDeleted);
			}
			timeRecordDao.save(timeRecord);
			timeRequest.setStatus(RequestStatus.APPROVED);
			timeRequestResponse = timeRequestDao.save(timeRequest);
		}

		return timeRequestResponse;
	}

	@Override
	public TimeRequest handleManualTimeEntryRequests(TimeRequest timeRequest, User currentUser,
			TimeRequestManagerPatchDto timeRequestManagerPatchDto) {
		log.info("handleManualTimeEntryRequests: executing manual time record method: {}", currentUser.getUserId());

		TimeRequest timeRequestResponse = null;
		if (timeRequestManagerPatchDto.getStatus().equals(RequestStatus.DENIED)) {
			timeRequestResponse = deleteTimeRequest(timeRequest);
		}
		else if (timeRequestManagerPatchDto.getStatus().equals(RequestStatus.APPROVED)) {
			TimeRecord timeRecord = timeRequest.getTimeRecord();
			List<TimeSlot> overlappingSlots = new ArrayList<>();
			if (timeRecord == null)
				timeRecord = buildTimeRecord(timeRequest, timeRequest.getEmployee());
			else {
				overlappingSlots = timeSlotDao.getFullyAndPartiallyOverlappingSlots(
						timeRequest.getTimeRecord().getTimeRecordId(), timeRequest.getRequestedStartTime(),
						timeRequest.getRequestedEndTime());
			}

			if (!overlappingSlots.isEmpty())
				handleOverlappingSlots(overlappingSlots, timeRequest, timeRecord);
			else
				handleIndependentTimeSlots(timeRequest, timeRecord);

			timeRequest.setStatus(RequestStatus.APPROVED);
			timeRequestResponse = timeRequestDao.save(timeRequest);
		}

		return timeRequestResponse;
	}

	@Override
	@Transactional
	public ResponseEntityDto managerAssignUsersTimeRecords(ManagerTimeRecordFilterDto managerTimeRecordFilterDto) {
		Long currentUser = userService.getCurrentUser().getUserId();
		log.info("managerAssignUsersTimeRecords: execution started by user: {}", currentUser);

		LocalDate startDate = managerTimeRecordFilterDto.getStartDate();
		LocalDate endDate = managerTimeRecordFilterDto.getEndDate();

		if (CommonModuleUtils.validateStartDateAndEndDate(startDate, endDate)) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_START_DATE_END_DATE_NOT_VALID);
		}

		List<Long> teamIdsToFilter = managerTimeRecordFilterDto.getTeamIds();

		if (userService.getCurrentUser().getEmployee().getEmployeeRole().getAttendanceRole() != Role.ATTENDANCE_ADMIN) {
			teamIdsToFilter = validateFilteringTeamsByManager(managerTimeRecordFilterDto.getTeamIds(),
					userService.getCurrentUser().getEmployee().getEmployeeId());
		}

		int pageSize = managerTimeRecordFilterDto.getSize();
		boolean isExport = managerTimeRecordFilterDto.getIsExport();
		if (isExport) {
			pageSize = Integer.MAX_VALUE;
		}

		Pageable pageable = PageRequest.of(managerTimeRecordFilterDto.getPage(), pageSize,
				managerTimeRecordFilterDto.getSortOrder(), managerTimeRecordFilterDto.getSortKey().toString());

		Page<Employee> employees = teamDao.findEmployeesInManagerLeadingTeams(teamIdsToFilter, pageable,
				userService.getCurrentUser());

		List<Long> employeeIds = employees.stream().map(Employee::getEmployeeId).toList();

		TimeRecordFilterDto timeRecordFilterDto = new TimeRecordFilterDto();
		timeRecordFilterDto.setStartDate(startDate);
		timeRecordFilterDto.setEndDate(endDate);
		Pageable timeRecordsPageable = PageRequest.of(timeRecordFilterDto.getPage(), Integer.MAX_VALUE,
				timeRecordFilterDto.getSortOrder(), timeRecordFilterDto.getSortKey().toString());
		List<EmployeeTimeRecord> timeRecords = timeRecordDao.findEmployeesTimeRecordsWithTeams(employeeIds,
				teamIdsToFilter.contains(-1L) ? null : teamIdsToFilter, startDate, endDate,
				timeRecordsPageable.getPageSize(), timeRecordsPageable.getOffset());

		List<LeaveRequest> leaveRequests = getLeaveRequests(startDate, endDate, employeeIds);

		List<TimeRecordsResponseDto> response = new ArrayList<>();
		for (Employee employee : employees.getContent()) {
			TimeRecordsResponseDto timeRecordsResponseDto = new TimeRecordsResponseDto();
			timeRecordsResponseDto.setEmployee(commonMapper.employeeToEmployeeTeamResponseDto(employee));

			List<EmployeeTimeRecord> employeeTimeRecords = timeRecords.stream()
				.filter(timeRecord -> timeRecord.getEmployeeId().equals(employee.getEmployeeId()))
				.toList();

			List<TimeRecordChipResponseDto> timeRecordRow = new ArrayList<>();
			for (EmployeeTimeRecord timeRecord : employeeTimeRecords) {
				TimeRecordChipResponseDto timeRecordChip = new TimeRecordChipResponseDto();
				timeRecordChip.setTimeRecordId(timeRecord.getTimeRecordId());
				timeRecordChip.setDate(timeRecord.getDate());
				timeRecordChip.setWorkedHours(timeRecord.getWorkedHours());
				timeRecordChip.setLeaveRequest(getLeaveRequestResponse(timeRecord.getDate(), leaveRequests, employee));
				timeRecordRow.add(timeRecordChip);
			}

			timeRecordsResponseDto.setTimeRecords(timeRecordRow);
			response.add(timeRecordsResponseDto);
		}

		PageDto pageDto = new PageDto();
		pageDto.setItems(response);
		pageDto.setTotalItems(employees.getTotalElements());
		pageDto.setTotalPages(employees.getTotalPages());
		pageDto.setCurrentPage(timeRecordFilterDto.getPage());

		log.info("managerAssignUsersTimeRecords: execution ended by user: {}", currentUser);
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto getAllAssignEmployeesTimeRequests(ManagerTimeRequestFilterDto timeRequestFilterDto) {
		User user = userService.getCurrentUser();
		log.info("getAllAssignEmployeesTimeRequests: execution started for user: {}", user.getUserId());

		Pageable pageable = PageRequest.of(timeRequestFilterDto.getPageNumber(), timeRequestFilterDto.getPageSize(),
				Sort.by(timeRequestFilterDto.getSortBy(), String.valueOf(timeRequestFilterDto.getSortKey())));

		Page<TimeRequest> timeRequests = timeRequestDao.findAllAssignEmployeesTimeRequests(user.getUserId(),
				timeRequestFilterDto, pageable);

		PageDto pageDto = pageTransformer.transform(timeRequests);

		List<TimeRequest> timeRequestList = timeRequests.hasContent() ? timeRequests.getContent()
				: Collections.emptyList();
		List<ManagerTimeRequestResponseDto> timeRequestResponseDtoList = timeMapper
			.timeRequestListToManagerTimeRequestResponseDtoList(timeRequestList);

		pageDto.setItems(timeRequestResponseDtoList);

		log.info("getAllAssignEmployeesTimeRequests: execution ended user: {} with {} result(s)", user.getUserId(),
				timeRequestResponseDtoList.size());
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto managerTeamTimeRecordSummary(TeamTimeRecordFilterDto timeRecordSummaryDto) {
		User user = userService.getCurrentUser();
		log.info("managerTeamTimeRecordSummary: execution started by user: {}", user.getUserId());

		return getTimeRecordSummaryDetails(timeRecordSummaryDto, user, Role.ATTENDANCE_MANAGER);
	}

	@Override
	@Transactional
	public ResponseEntityDto getManagerEmployeeDailyLog(ManagerEmployeeLogFilterDto managerEmployeeLogFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("getManagerEmployeeDailyLog: execution started");

		LocalDate startDate = managerEmployeeLogFilterDto.getStartDate();
		LocalDate endDate = managerEmployeeLogFilterDto.getEndDate();

		int pageSize = managerEmployeeLogFilterDto.getSize();
		boolean isExport = managerEmployeeLogFilterDto.getIsExport();

		Optional<Employee> employeeOptional = employeeDao
			.findEmployeeByEmployeeIdAndUserActiveNot(managerEmployeeLogFilterDto.getEmployeeId(), false);
		if (employeeOptional.isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}
		Employee employee = employeeOptional.get();

		Pageable defaultPageable = PageRequest.of(0, Integer.MAX_VALUE);
		List<Employee> managerEmployees = employeeDao.findEmployeesByManagerId(currentUser.getUserId(), defaultPageable)
			.getContent();
		Optional<Employee> optionalAssignedEmployee = managerEmployees.stream()
			.filter(emp -> emp.getEmployeeId().equals(managerEmployeeLogFilterDto.getEmployeeId()))
			.findFirst();
		if (optionalAssignedEmployee.isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_MANAGER_CANNOT_VIEW_EMPLOYEE_DATA);
		}

		List<Long> employees = List.of(employee.getEmployeeId());
		Long totalItemCount = timeRecordDao.getTotalEmployeesTimeRecordCount(employees, startDate, endDate);

		if (isExport) {
			pageSize = Math.toIntExact(totalItemCount);
		}

		Pageable pageable = PageRequest.of(managerEmployeeLogFilterDto.getPage(), pageSize, Sort
			.by(managerEmployeeLogFilterDto.getSortOrder(), managerEmployeeLogFilterDto.getSortKey().toString()));

		List<EmployeeTimeRecord> timeRecords = timeRecordDao.findEmployeesTimeRecords(employees, startDate, endDate,
				pageable.getPageSize(), pageable.getOffset());

		List<ManagerEmployeeDailyRecordsResponseDto> responseDtos = new ArrayList<>();
		for (EmployeeTimeRecord employeeTimeRecord : timeRecords) {
			ManagerEmployeeDailyRecordsResponseDto managerEmployeeDailyRecordsResponseDto = new ManagerEmployeeDailyRecordsResponseDto();
			managerEmployeeDailyRecordsResponseDto.setTimeRecordId(employeeTimeRecord.getTimeRecordId());
			managerEmployeeDailyRecordsResponseDto.setDate(employeeTimeRecord.getDate());
			managerEmployeeDailyRecordsResponseDto.setDay(DateTimeUtils.getDayOfWeek(employeeTimeRecord.getDate()));
			managerEmployeeDailyRecordsResponseDto.setWorkedHours(employeeTimeRecord.getWorkedHours());
			managerEmployeeDailyRecordsResponseDto.setBreakHours(employeeTimeRecord.getBreakHours());

			if (employeeTimeRecord.getTimeSlots() != null) {
				managerEmployeeDailyRecordsResponseDto
					.setTimeSlots(mapper.readValue(employeeTimeRecord.getTimeSlots(), new TypeReference<>() {
					}));
			}
			else {
				managerEmployeeDailyRecordsResponseDto.setTimeSlots(new ArrayList<>());
			}
			responseDtos.add(managerEmployeeDailyRecordsResponseDto);
		}

		PageDto pageDto = new PageDto();
		pageDto.setItems(responseDtos);
		pageDto.setTotalItems(totalItemCount);
		pageDto.setTotalPages(managerEmployeeLogFilterDto.getSize() == 0 ? 1
				: (int) Math.ceil((double) totalItemCount / (double) managerEmployeeLogFilterDto.getSize()));
		pageDto.setCurrentPage(managerEmployeeLogFilterDto.getPage());

		log.info("getManagerEmployeeDailyLog: execution ended by user: {}", currentUser.getUserId());
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	public ResponseEntityDto getIndividualWorkHoursBySupervisor(
			IndividualWorkHourFilterDto individualWorkHourFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("getIndividualWorkHoursOfEmployee: execution started by user: {}", currentUser.getUserId());

		if (currentUser.getEmployee().getEmployeeRole().getAttendanceRole().equals(Role.ATTENDANCE_EMPLOYEE)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_MANAGER_PERMISSION_NOT_FOUND);
		}

		Optional<Employee> employeeOpt = employeeDao.findById(individualWorkHourFilterDto.getEmployeeId());
		if (employeeOpt.isEmpty()) {
			throw new EntityNotFoundException(
					messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND));
		}

		IndividualWorkHoursResponseDto response = getEmployeeWorkHourGraphResponseDto(individualWorkHourFilterDto);

		log.info("getIndividualWorkHoursOfEmployee: execution ended");
		return new ResponseEntityDto(false, response);
	}

	@Override
	public ResponseEntityDto getIndividualWorkUtilizationByManager(Long id) {
		User currentUser = userService.getCurrentUser();
		log.info("getIndividualWorkUtilizationByManager: execution started by {}", currentUser.getUserId());

		if (currentUser.getEmployee().getEmployeeRole().getAttendanceRole().equals(Role.ATTENDANCE_EMPLOYEE)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_MANAGER_PERMISSION_NOT_FOUND);
		}

		Optional<Employee> employeeOpt = employeeDao.findById(id);
		if (employeeOpt.isEmpty()) {
			throw new EntityNotFoundException(
					messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND));
		}

		if (employeeOpt.get()
			.getEmployeeManagers()
			.stream()
			.noneMatch(em -> em.getManager().getEmployeeId().equals(currentUser.getEmployee().getEmployeeId()))) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_MANAGER_CANNOT_VIEW_EMPLOYEE_DATA);
		}

		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<LocalDate> holidays = holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();

		UtilizationPercentageDto utilizationInfo = calculateWorkTimeUtilization(
				List.of(employeeOpt.get().getEmployeeId()), timeConfigs, holidays);

		log.info("getIndividualWorkUtilizationByManager: execution ended {}", currentUser.getUserId());
		return new ResponseEntityDto(false, utilizationInfo);
	}

	public ResponseEntityDto checkLeaveOrHolidayOrNonWorkingDay() {
		User currentUser = userService.getCurrentUser();
		log.info("checkLeaveOrHolidayOrNonWorkingDay: execution started by user: {}", currentUser.getUserId());

		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();

		List<TimeConfig> workingDays = timeConfigDao.findAll();
		boolean isWorkingDay = CommonModuleUtils.checkIfDayIsWorkingDay(currentDate, workingDays,
				organizationService.getOrganizationTimeZone());

		boolean attendanceConfigForNonWorkingDays = attendanceConfigService
			.getAttendanceConfigByType(AttendanceConfigType.CLOCK_IN_ON_NON_WORKING_DAYS);
		if (!attendanceConfigForNonWorkingDays && !isWorkingDay) {
			ActiveTimeSlotResponseDto activeTimeSlotResponseDto = new ActiveTimeSlotResponseDto();
			activeTimeSlotResponseDto.setPeriodType(TimeRecordActionTypes.NON_WORKING_DAY);
			return new ResponseEntityDto(false, activeTimeSlotResponseDto);
		}

		if (isWorkingDay) {
			DayOfWeek day = currentDate.getDayOfWeek();
			TimeConfig currentDayConfig = workingDays.stream()
				.filter(timeConfig -> timeConfig.getDay().equals(day))
				.findAny()
				.orElse(null);

			assert currentDayConfig != null;
			Map<String, Float> hoursMap = TimeUtil.extractHours(currentDayConfig);
			float morningHours = hoursMap.get(CommonConstants.DEFAULT_TIME_CONFIG_VALUE_MORNING);
			float eveningHours = hoursMap.get(CommonConstants.DEFAULT_TIME_CONFIG_VALUE_EVENING);

			List<LeaveRequest> leaveRequestsList = leaveRequestDao.findLeaveRequestsForTodayByUser(currentDate,
					currentUser.getEmployee().getEmployeeId());

			ResponseEntityDto activeTimeSlotResponseDto1 = getAllActiveSlotsNoLeaveDay(currentDayConfig, morningHours,
					eveningHours, leaveRequestsList);
			if (activeTimeSlotResponseDto1 != null)
				return activeTimeSlotResponseDto1;

			return getAllActiveSlots(currentDate, currentDayConfig, morningHours, eveningHours);
		}

		return null;
	}

	private void handleTimeEntryRequestAutoApproval(TimeRequest timeRequest) {
		log.info("handleTimeEntryRequestAutoApproval: execution started");
		User currentUser = userService.getCurrentUser();

		TimeRequestManagerPatchDto timeRequestManagerPatchDto = new TimeRequestManagerPatchDto();
		timeRequestManagerPatchDto.setStatus(RequestStatus.APPROVED);

		TimeRequest timeRequestResponse;
		Optional<EmployeeManager> primaryManager = currentUser.getEmployee()
			.getEmployeeManagers()
			.stream()
			.filter(EmployeeManager::getIsPrimaryManager)
			.findFirst();

		if (primaryManager.isEmpty()) {
			log.info(
					"handleTimeEntryRequestAutoApproval: attendanceConfig for auto approval has no primary manager found");
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_TIME_REQUEST_MANAGER_MISMATCH);
		}

		User managerUser = primaryManager.get().getManager().getUser();
		if (timeRequest.getRequestType().equals(RequestType.EDIT_RECORD_REQUEST))
			timeRequestResponse = handleEditTimeRecordRequests(timeRequest, managerUser, timeRequestManagerPatchDto);
		else {
			timeRequestResponse = handleManualTimeEntryRequests(timeRequest, managerUser, timeRequestManagerPatchDto);
		}

		timeEmailService.sendTimeEntryRequestAutoApprovedEmployeeEmail(timeRequestResponse);
		attendanceNotificationService.sendTimeEntryRequestAutoApprovedEmployeeNotification(timeRequestResponse);

		timeEmailService.sendTimeEntryRequestAutoApprovedManagerEmail(timeRequestResponse);
		attendanceNotificationService.sendTimeEntryRequestAutoApprovedManagerNotification(timeRequestResponse);
	}

	private ResponseEntityDto getAllActiveSlotsNoLeaveDay(TimeConfig currentDayConfig, float morningHours,
			float eveningHours, List<LeaveRequest> leaveRequestsList) {
		boolean attendanceConfigForLeaveRequests = attendanceConfigService
			.getAttendanceConfigByType(AttendanceConfigType.CLOCK_IN_ON_LEAVE_DAYS);
		if (!attendanceConfigForLeaveRequests && !leaveRequestsList.isEmpty()) {
			for (LeaveRequest leaveRequest : leaveRequestsList) {
				boolean isEveningLeave = leaveRequest.getLeaveState() == LeaveState.HALFDAY_EVENING
						&& TimeUtil.isCurrentTimeInEvening(currentDayConfig, morningHours, eveningHours);
				boolean isMorningLeave = leaveRequest.getLeaveState() == LeaveState.HALFDAY_MORNING
						&& TimeUtil.isCurrentTimeInMorning(currentDayConfig, morningHours);
				boolean isFullDayLeave = leaveRequest.getLeaveState() == LeaveState.FULLDAY;

				if (isEveningLeave || isMorningLeave || isFullDayLeave) {
					ActiveTimeSlotResponseDto activeTimeSlotResponseDto = new ActiveTimeSlotResponseDto();
					activeTimeSlotResponseDto.setPeriodType(TimeRecordActionTypes.LEAVE_DAY);
					return new ResponseEntityDto(false, activeTimeSlotResponseDto);
				}
			}
		}
		return null;
	}

	private ResponseEntityDto getAllActiveSlots(LocalDate currentDate, TimeConfig currentDayConfig, float morningHours,
			float eveningHours) {
		List<Holiday> holidayList = holidayDao.findAllByIsActiveTrueAndDate(currentDate);

		boolean attendanceConfigForHolidays = attendanceConfigService
			.getAttendanceConfigByType(AttendanceConfigType.CLOCK_IN_ON_COMPANY_HOLIDAYS);
		if (!attendanceConfigForHolidays && !holidayList.isEmpty()) {
			for (Holiday holiday : holidayList) {
				boolean isEveningHoliday = holiday.getHolidayDuration() == HolidayDuration.HALF_DAY_MORNING
						&& TimeUtil.isCurrentTimeInEvening(currentDayConfig, morningHours, eveningHours);
				boolean isMorningHoliday = holiday.getHolidayDuration() == HolidayDuration.HALF_DAY_MORNING
						&& TimeUtil.isCurrentTimeInMorning(currentDayConfig, morningHours);
				boolean isFullDayHoliday = holiday.getHolidayDuration() == HolidayDuration.FULL_DAY;

				if (isEveningHoliday || isMorningHoliday || isFullDayHoliday) {
					ActiveTimeSlotResponseDto activeTimeSlotResponseDto = new ActiveTimeSlotResponseDto();
					activeTimeSlotResponseDto.setPeriodType(TimeRecordActionTypes.HOLIDAY);
					return new ResponseEntityDto(false, activeTimeSlotResponseDto);
				}
			}
		}
		return null;
	}

	private TimeConfig createTimeConfig(TimeConfigDto.DayCapacity timeConfig) {
		TimeConfig newTimeConfig = new TimeConfig();
		newTimeConfig.setDay(timeConfig.day());
		newTimeConfig.setTimeBlocks(mapper.valueToTree(timeConfig.timeBlocks()));
		newTimeConfig.setTotalHours(timeConfig.totalHours());
		int hours = timeConfig.time().getHour();
		int minute = timeConfig.time().getMinute();
		newTimeConfig.setStartHour(hours);
		newTimeConfig.setStartMinute(minute);
		newTimeConfig.setIsWeekStartDay(timeConfig.isWeekStartDay());
		return newTimeConfig;
	}

	private void updateTimeConfig(TimeConfig currentConfig, TimeConfigDto.DayCapacity timeConfig) {
		currentConfig.setTotalHours(timeConfig.totalHours());

		Map<String, Float> hoursMap = new HashMap<>();
		hoursMap.put(TimeBlocks.MORNING_HOURS.name(), timeConfig.totalHours() / 2);
		hoursMap.put(TimeBlocks.EVENING_HOURS.name(), timeConfig.totalHours() / 2);

		currentConfig.setTimeBlocks((timeConfig.timeBlocks() != null) ? (mapper.valueToTree(timeConfig.timeBlocks()))
				: (createTimeConfigJsonNode(hoursMap)));
		int hours = timeConfig.time().getHour();
		int minute = timeConfig.time().getMinute();
		currentConfig.setStartHour(hours);
		currentConfig.setStartMinute(minute);
		currentConfig.setIsWeekStartDay((timeConfig.isWeekStartDay()));
	}

	private List<LeaveRequestResponseDto> findLeaveRequestsByDateRange(LeaveRequestFilterDto leaveRequestFilterDto,
			Long employeeId) {
		List<LeaveRequestResponseDto> leaveRequestResponseDtos;
		List<LeaveRequest> leaveRequests = leaveRequestDao.findLeaveRequestsByDateRange(leaveRequestFilterDto,
				employeeId);
		leaveRequestResponseDtos = leaveMapper.leaveRequestListToLeaveRequestResponseDtoList(leaveRequests);
		return leaveRequestResponseDtos;
	}

	private TimeRequest deleteTimeRequest(TimeRequest timeRequest) {
		timeRequest.setStatus(RequestStatus.DENIED);
		return timeRequestDao.save(timeRequest);
	}

	private void handleExpandClockInClockOut(TimeRequest timeRequest, TimeRecord timeRecord, List<TimeSlot> timeSlots,
			RecordType recordType) {
		// when a new clock in time is less than the current clockin value or the new
		// clockout value is greater than the current clockout value, the initial time
		// request period expands to the new time request period
		if (recordType.equals(RecordType.CLOCK_IN)) {
			if (timeRequest.getRequestedStartTime() < timeRequest.getInitialClockIn()) {
				timeSlots.getFirst().setStartTime(timeRequest.getRequestedStartTime());
				timeRecord.setClockInTime(timeRequest.getRequestedStartTime());
			}
		}
		else {
			if (timeRequest.getInitialClockOut() == null
					|| timeRequest.getRequestedEndTime() > timeRequest.getInitialClockOut()) {
				timeSlots.getLast().setEndTime(timeRequest.getRequestedEndTime());
				timeRecord.setClockOutTime(timeRequest.getRequestedEndTime());
				if (timeRequest.getInitialClockOut() == null) {
					timeSlots.getLast().setActiveRightNow(false);
					timeRecord.setCompleted(true);
				}
			}
		}
	}

	private TimeRecord buildTimeRecord(TimeRequest timeRequest, Employee employee) {
		LocalDateTime clockInDateTime = DateTimeUtils.epochMillisToUtcLocalDateTime(timeRequest.getRequestedStartTime(),
				null);
		DayOfWeek dayOfWeek = DayOfWeek.values()[(clockInDateTime.getDayOfWeek().getValue() + 5) % 7];
		LocalDate clockInDate = clockInDateTime.toLocalDate();
		return timeMapper.buildNewTimeRecord(employee, timeRequest, dayOfWeek, clockInDate);
	}

	private void handleShrinkClockInClockOut(TimeRequest timeRequest, TimeRecord timeRecord, RecordType recordType,
			List<TimeSlot> timeSlots, List<TimeSlot> timeSlotsToBeDeleted) {
		// when a new clock in time is greater than the current clockin value or the new
		// clockout value is less than the current clockout value, the initial time
		// request period shrink to the new time request period
		if (recordType.equals(RecordType.CLOCK_IN)) {
			handleShrinkClockIn(timeSlots, timeSlotsToBeDeleted, timeRequest);
			timeRecord.setClockInTime(timeRequest.getRequestedStartTime());
		}
		else {
			handleShrinkClockOut(timeSlots, timeSlotsToBeDeleted, timeRequest);
			timeRecord.setClockOutTime(timeRequest.getRequestedEndTime());
		}
	}

	private void handleShrinkClockIn(List<TimeSlot> timeSlots, List<TimeSlot> timeSlotsToBeDeleted,
			TimeRequest timeRequest) {
		// if the new clockin time is less than the current clockin time, the logic
		// needed to be handled to reduce the time from existing time slots
		for (TimeSlot slot : timeSlots) {
			if (slot.getEndTime() == null) {
				continue;
			}
			if (slot.getStartTime() < timeRequest.getRequestedStartTime()
					&& slot.getEndTime() < timeRequest.getRequestedStartTime()) {
				timeSlotsToBeDeleted.add(slot);
			}
			else if (slot.getStartTime() < timeRequest.getRequestedStartTime()
					&& slot.getEndTime() > timeRequest.getRequestedStartTime()) {
				slot.setStartTime(timeRequest.getRequestedStartTime());
			}
		}
	}

	private void handleOverlappingSlots(List<TimeSlot> overlappingSlots, TimeRequest timeRequest,
			TimeRecord timeRecord) {
		log.info("handleOverlappingSlots: executing overlapping slots method: {}",
				timeRequest.getTimeRecord().getTimeRecordId());
		if (timeRequest.getRequestedStartTime() < timeRecord.getClockInTime())
			timeRecord.setClockInTime(timeRequest.getRequestedStartTime());
		if (timeRequest.getRequestedEndTime() > timeRecord.getClockOutTime())
			timeRecord.setClockOutTime(timeRequest.getRequestedEndTime());

		List<TimeSlot> updatedTimeSlots = new ArrayList<>();
		List<Long> timeSlotsToBeDeleted = new ArrayList<>();

		for (TimeSlot timeSlot : overlappingSlots) {
			if (timeSlot.getEndTime() == null) {
				timeSlot.setEndTime(timeRequest.getRequestedEndTime());
			}
			if (timeSlot.getStartTime() >= timeRequest.getRequestedStartTime()
					&& timeSlot.getEndTime() <= timeRequest.getRequestedEndTime()) {
				timeSlotsToBeDeleted.add(timeSlot.getTimeSlotId());
			}
			else if (timeRequest.getRequestedStartTime() > timeSlot.getStartTime()
					&& timeRequest.getRequestedStartTime() < timeSlot.getEndTime()) {
				timeSlot.setEndTime(timeRequest.getRequestedStartTime());
				updatedTimeSlots.add(timeSlot);
			}
			else if (timeRequest.getRequestedEndTime() > timeSlot.getStartTime()
					&& timeRequest.getRequestedEndTime() < timeSlot.getEndTime()) {
				timeSlot.setStartTime(timeRequest.getRequestedEndTime());
				updatedTimeSlots.add(timeSlot);
			}
		}

		TimeSlot manualTimeSlot = timeMapper.newTimeSlotToTimeSlot(timeRequest.getRequestedStartTime(), SlotType.WORK,
				false, timeRecord, true);
		manualTimeSlot.setEndTime(timeRequest.getRequestedEndTime());

		timeRecord.setWorkedHours(timeRequest.getWorkHours());
		timeRecord.setBreakHours(timeRequest.getBreakHours());

		timeRecord = timeRecordDao.save(timeRecord);
		if (timeRequest.getTimeRecord() == null) {
			timeRequest.setTimeRecord(timeRecord);
			timeRequestDao.save(timeRequest);
		}
		timeSlotDao.deleteAllById(timeSlotsToBeDeleted);
		timeSlotDao.saveAll(updatedTimeSlots);
		timeSlotDao.save(manualTimeSlot);
	}

	private void handleShrinkClockOut(List<TimeSlot> timeSlots, List<TimeSlot> timeSlotsToBeDeleted,
			TimeRequest timeRequest) {
		// if the new clockout time is greater than the current clockout time, the logic
		// needed to be handled to reduce the time from existing time slots
		for (TimeSlot slot : timeSlots) {
			if (slot.getEndTime() == null) {
				slot.setEndTime(timeRequest.getRequestedEndTime());
				continue;
			}
			if (slot.getEndTime() > timeRequest.getRequestedEndTime()
					&& slot.getStartTime() > timeRequest.getRequestedEndTime()) {
				timeSlotsToBeDeleted.add(slot);
			}
			else if (slot.getStartTime() < timeRequest.getRequestedEndTime()
					&& slot.getEndTime() > timeRequest.getRequestedEndTime()) {
				slot.setEndTime(timeRequest.getRequestedEndTime());
			}
		}
	}

	private void handleIndependentTimeSlots(TimeRequest timeRequest, TimeRecord timeRecord) {
		log.info("handleIndependentTimeSlots: executing independent time slots method for request ID: {}",
				timeRequest.getTimeRequestId());
		TimeSlot manualTimeSlot = timeMapper.newTimeSlotToTimeSlot(timeRequest.getRequestedStartTime(), SlotType.WORK,
				false, timeRecord, true);
		manualTimeSlot.setEndTime(timeRequest.getRequestedEndTime());

		timeRecord.setWorkedHours(timeRequest.getWorkHours());
		if (timeRequest.getRequestedStartTime() < timeRecord.getClockInTime())
			timeRecord.setClockInTime(timeRequest.getRequestedStartTime());
		if (timeRequest.getRequestedEndTime() > timeRecord.getClockOutTime())
			timeRecord.setClockOutTime(timeRequest.getRequestedEndTime());

		timeRecordDao.save(timeRecord);
		timeSlotDao.save(manualTimeSlot);
		log.info("handleIndependentTimeSlots: execution completed");
	}

	private List<Long> validateFilteringTeamsByManager(List<Long> filteringTeams, Long managerId) {
		List<Long> teamIdsToFilter;
		HashSet<Long> managingTeams = new HashSet<>(
				teamDao.findLeadingTeamsByManagerId(managerId).stream().map(Team::getTeamId).toList());

		if (filteringTeams != null && !filteringTeams.isEmpty() && !filteringTeams.contains(-1L)) {
			teamIdsToFilter = filteringTeams;
			if (Boolean.FALSE.equals(teamDao.existsAllByTeamIdIn(teamIdsToFilter.stream().toList()))) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
			}
			if (!managingTeams.containsAll(teamIdsToFilter)) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_TEAM_NOT_FOUND);
			}
		}
		else {

			teamIdsToFilter = Stream.of(-1L).toList();
		}
		return teamIdsToFilter;
	}

	private List<LeaveRequest> getLeaveRequests(LocalDate startDate, LocalDate endDate, List<Long> employeeIds) {
		LeaveRequestFilterDto leaveRequestFilterDto = new LeaveRequestFilterDto();
		leaveRequestFilterDto.setStartDate(startDate);
		leaveRequestFilterDto.setEndDate(endDate);
		return leaveRequestDao.findLeaveRequestsByDateRangeAndEmployees(leaveRequestFilterDto, employeeIds);
	}

	private LeaveRequestResponseDto getLeaveRequestResponse(LocalDate date, List<LeaveRequest> leaveRequests,
			Employee employee) {
		LeaveRequest leaveRequest = leaveRequests.stream()
			.filter(req -> req.getEmployee().getEmployeeId().equals(employee.getEmployeeId())
					&& TimeUtil.isDateWithinRange(req.getStartDate(), req.getEndDate(), date))
			.findFirst()
			.orElse(null);
		return leaveMapper.leaveRequestToLeaveRequestResponseDto(leaveRequest);
	}

	@NotNull
	private ResponseEntityDto getTimeRecordSummaryDetails(TeamTimeRecordFilterDto timeRecordSummaryDto, User user,
			Role role) {
		timeRecordSummaryDateValidations(timeRecordSummaryDto);

		if (Boolean.TRUE.equals(timeRecordSummaryDto.getIsExport())) {
			timeRecordSummaryDto.setPageNumber(0);
			timeRecordSummaryDto.setPageSize(Integer.MAX_VALUE);
		}

		Pageable pageable = PageRequest.of(timeRecordSummaryDto.getPageNumber(), timeRecordSummaryDto.getPageSize());

		Optional<Team> team = teamDao.findByTeamIdAndIsActive(timeRecordSummaryDto.getTeamId(), true);

		if (team.isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_TEAM_NOT_FOUND);
		}

		if (role.equals(Role.ATTENDANCE_MANAGER) && (team.get()
			.getEmployees()
			.stream()
			.noneMatch(emp -> emp.getEmployee().getEmployeeId().equals(user.getEmployee().getEmployeeId())
					&& emp.getIsSupervisor()))) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_IS_NOT_A_TEAM_SUPERVISOR);
		}

		List<Employee> employees = teamDao.findEmployeesInTeamByTeamId(timeRecordSummaryDto.getTeamId(), pageable);
		List<Long> employeeIds = employees.stream().map(Employee::getEmployeeId).toList();

		EmployeesOnLeavePeriodFilterDto employeesOnLeavePeriodFilterDto = new EmployeesOnLeavePeriodFilterDto();
		employeesOnLeavePeriodFilterDto.setStartDate(timeRecordSummaryDto.getStartDate());
		employeesOnLeavePeriodFilterDto.setEndDate(timeRecordSummaryDto.getEndDate());
		employeesOnLeavePeriodFilterDto.setTeamIds(List.of(timeRecordSummaryDto.getTeamId()));

		List<Holiday> holidays = holidayDao.findAllByIsActiveTrueAndDateBetween(timeRecordSummaryDto.getStartDate(),
				timeRecordSummaryDto.getEndDate());
		List<LeaveRequest> leaveRequests = leaveRequestDao.getLeaveRequestsByTeamId(employeesOnLeavePeriodFilterDto);

		LocalDate startDate = timeRecordSummaryDto.getStartDate();
		LocalDate endDate = timeRecordSummaryDto.getEndDate();
		List<TimeRecordsByEmployeesDto> timeRecordsByEmployees = timeRecordDao.getTimeRecordsByEmployees(employeeIds,
				startDate, endDate);

		List<TimeRecordsResponseDto> employeeTimeRecordSummaries = new ArrayList<>();
		for (Employee employee : employees) {
			TimeRecordsResponseDto employeeTimeRecordSummary = new TimeRecordsResponseDto();
			List<TimeRecordChipResponseDto> timeRecords = new ArrayList<>();
			employeeTimeRecordSummary.setEmployee(commonMapper.employeeToEmployeeTeamResponseDto(employee));

			List<TimeRecordsByEmployeesDto> timeRecordsForUser = timeRecordsByEmployees.stream()
				.filter(timeRecord -> timeRecord.getEmployeeId().equals(employee.getEmployeeId()))
				.toList();
			for (TimeRecordsByEmployeesDto timeRecordsByEmployee : timeRecordsForUser) {
				TimeRecordChipResponseDto employeePeriodTimeRecords = timeMapper
					.timeRecordsByEmployeeToTimeRecordRowResponseDto(timeRecordsByEmployee);

				Optional<LeaveRequest> leaveRequestExist = leaveRequests.stream().filter(leaveRequest -> {
					LocalDate leaveStartDate = leaveRequest.getStartDate();
					LocalDate leaveEndDate = leaveRequest.getEndDate();
					LocalDate currentDate = timeRecordsByEmployee.getDate();

					boolean isInRange = !currentDate.isBefore(leaveStartDate) && !currentDate.isAfter(leaveEndDate);
					return leaveRequest.getEmployee().getEmployeeId().equals(employee.getEmployeeId()) && isInRange;
				}).findFirst();

				leaveRequestExist.ifPresent(leaveRequest -> employeePeriodTimeRecords
					.setLeaveRequest(leaveMapper.leaveRequestToLeaveRequestResponseDto(leaveRequest)));

				timeRecords.add(employeePeriodTimeRecords);
			}

			employeeTimeRecordSummary.setTimeRecords(timeRecords);
			employeeTimeRecordSummaries.add(employeeTimeRecordSummary);
		}

		TeamTimeRecordSummaryResponseDto teamTimeRecordSummaryResponseDto = new TeamTimeRecordSummaryResponseDto();
		teamTimeRecordSummaryResponseDto.setEmployeeTimeRecordSummaries(employeeTimeRecordSummaries);
		handleTimeSheetSummary(teamTimeRecordSummaryResponseDto, timeRecordSummaryDto.getStartDate(),
				timeRecordSummaryDto.getEndDate(), leaveRequests, holidays, employeeIds, timeRecordSummaryDto);

		PageDto pageDto = new PageDto();
		pageDto.setItems(teamTimeRecordSummaryResponseDto);
		pageDto.setTotalItems((long) employees.size());
		pageDto.setTotalPages(timeRecordSummaryDto.getPageSize() == 0 ? 1
				: (int) Math.ceil(employees.size() / (double) timeRecordSummaryDto.getPageSize()));
		pageDto.setCurrentPage(timeRecordSummaryDto.getPageNumber());

		return new ResponseEntityDto(false, pageDto);
	}

	private void timeRecordSummaryDateValidations(TeamTimeRecordFilterDto timeRecordSummaryDto) {
		if (timeRecordSummaryDto.getEndDate().isBefore(timeRecordSummaryDto.getStartDate())) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_START_DATE_END_DATE_NOT_VALID);
		}
	}

	private IndividualWorkHoursResponseDto getEmployeeWorkHourGraphResponseDto(
			IndividualWorkHourFilterDto individualWorkHourFilterDto) {
		int year = DateTimeUtils.getCurrentYear();
		int month = individualWorkHourFilterDto.getMonth();

		YearMonth yearMonth = YearMonth.of(year, month);

		LocalDate firstDay = yearMonth.atDay(1);
		LocalDate lastDay = yearMonth.atEndOfMonth();

		List<EmployeeWorkHours> employeeWorkHours = timeRecordDao
			.getAllWorkHoursOfEmployee(individualWorkHourFilterDto.getEmployeeId(), firstDay, lastDay);

		IndividualWorkHoursResponseDto response = new IndividualWorkHoursResponseDto();
		response.setMonth(month);
		response.setMonthName(yearMonth.getMonth().name());
		response.setEmployeeWorkHours(employeeWorkHours);

		return response;
	}

	/*
	 * Work Hour Utilization Work Time Utilization = (Total hours worked by team up to
	 * current date in the current month / Total standard work hours up to the current
	 * date in the current month for the team) × 100 Percentage Change = (Current
	 * Utilization Rate - Utilization Rate as of 30 days prior) / Utilization Rate as of
	 * 30 days prior) x 100
	 */
	public UtilizationPercentageDto calculateWorkTimeUtilization(List<Long> employeeId, List<TimeConfig> timeConfigs,
			List<LocalDate> holidays) {
		float standardWorkHoursPerDay = getHoursPerDay();

		LocalDate yesterday = DateTimeUtils.getCurrentUtcDate().minusDays(1);

		LocalDate oneDayBeforeOneMonthPriorDate = DateTimeUtils.getCurrentUtcDate().minusMonths(1).minusDays(1);

		LocalDate sixtyDaysBeforeYesterday = DateTimeUtils.getCurrentUtcDate().minusMonths(2).minusDays(1);

		String organizationTimeZone = organizationService.getOrganizationTimeZone();

		int noOfWorkingDaysForLast30daysFromYesterday = CommonModuleUtils.getWorkingDaysBetweenTwoDates(
				oneDayBeforeOneMonthPriorDate, yesterday, timeConfigs, holidays, organizationTimeZone);
		double totalWorkedHoursForLast30DaysFromYesterday = getWorkedHoursForDateRange(oneDayBeforeOneMonthPriorDate,
				yesterday, employeeId);
		double totalStandardWorkedHoursForLast30DaysFromYesterday = standardWorkHoursPerDay
				* noOfWorkingDaysForLast30daysFromYesterday;
		double currentUtilizationPercentage = (totalWorkedHoursForLast30DaysFromYesterday
				/ totalStandardWorkedHoursForLast30DaysFromYesterday) * 100;

		int numberOfWorkingDaysFromPreMonthStartToOneMonthBeforeDate = CommonModuleUtils.getWorkingDaysBetweenTwoDates(
				sixtyDaysBeforeYesterday, oneDayBeforeOneMonthPriorDate, timeConfigs, holidays, organizationTimeZone);
		double totalWorkedHoursPriorToLastThirtyDays = getWorkedHoursForDateRange(sixtyDaysBeforeYesterday,
				oneDayBeforeOneMonthPriorDate, employeeId);
		double totalStandardWorkedHoursUptoLastThirtyDays = standardWorkHoursPerDay
				* numberOfWorkingDaysFromPreMonthStartToOneMonthBeforeDate;
		double lastThirtyDayUtilizationRate = (totalWorkedHoursPriorToLastThirtyDays
				/ totalStandardWorkedHoursUptoLastThirtyDays) * 100;

		double percentageChange = ((currentUtilizationPercentage - lastThirtyDayUtilizationRate)
				/ lastThirtyDayUtilizationRate) * 100;
		double percentageValue = Double.isInfinite(percentageChange) ? 0.0
				: Math.round(percentageChange * 100.0) / 100.0;

		return new UtilizationPercentageDto(Math.round(currentUtilizationPercentage * 100.0) / 100.0, percentageValue);
	}

	public float getHoursPerDay() {
		LocalDate localDate = LocalDate.now();

		DayOfWeek dayOfWeek = localDate.getDayOfWeek();
		TimeConfig timeConfigs = timeConfigDao.findByDay(dayOfWeek);

		if (timeConfigs == null) {
			throw new EntityNotFoundException(
					messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_TIME_CONFIGS_NOT_FOUND));
		}
		return Float.parseFloat(String.valueOf(timeConfigs.getTotalHours()));
	}

	private TimeRecord findTimeRecordForTheRequest(TimeRequestDto timeRequestDto) {
		TimeRecord timeRecordTotReturn = null;
		if (timeRequestDto.getRecordId() != null) {
			Optional<TimeRecord> optionalTimeRecord = timeRecordDao.findById(timeRequestDto.getRecordId());
			if (optionalTimeRecord.isEmpty()) {
				throw new EntityNotFoundException(
						String.format(messageUtil.getMessage(TimeMessageConstant.TIME_ERROR_NO_TIME_RECORD_FOUND),
								timeRequestDto.getRecordId()));
			}
			timeRecordTotReturn = optionalTimeRecord.get();
		}
		else {

			if (timeRequestDto.getStartTime().isAfter(DateTimeUtils.getCurrentUtcDateTime())) {
				throw new ModuleException(TimeMessageConstant.TIME_ERROR_CANNOT_ADD_REQUEST_FOR_FUTURE);
			}

			if (timeRequestDto.getRequestType().equals(RequestType.EDIT_RECORD_REQUEST)) {
				throw new ModuleException(TimeMessageConstant.TIME_ERROR_NO_TIME_RECORD_TO_EDIT);
			}
		}
		return timeRecordTotReturn;
	}

	private void validateTimeRecord(TimeRecord timeRecord, TimeRequestDto timeRequestDto) {
		if (!Objects.equals(timeRecord.getEmployee().getUser().getUserId(), userService.getCurrentUser().getUserId())) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_TIME_RECORD_EMPLOYEE_ID_MISMATCH,
					new String[] { timeRequestDto.getRecordId().toString() });
		}

		LocalDate requestStartDate = timeRequestDto.getStartTime().toLocalDate();
		LocalDate recordDate = timeRecord.getDate();

		if (!requestStartDate.equals(recordDate)) {
			throw new ModuleException(
					TimeMessageConstant.TIME_ERROR_TIME_RECORD_DATE_AND_REQUEST_START_DATETIME_MISMATCH);
		}

		if (timeRecord.getClockInTime() == null) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_CLOCK_IN_NOT_FOUND);
		}
	}

	private TimeRequest timeRequestBuilder(TimeRequestDto timeRequestDto, Employee employee, TimeRecord timeRecord) {
		TimeRequest timeRequest = timeMapper.timeRequestDtoToTimeRequest(timeRequestDto, RequestStatus.PENDING,
				employee, timeRecord, timeRecord == null ? null : timeRecord.getClockInTime(),
				timeRecord == null ? null : timeRecord.getClockOutTime(),
				DateTimeUtils.localDateTimeToEpochMillis(timeRequestDto.getStartTime()),
				DateTimeUtils.localDateTimeToEpochMillis(timeRequestDto.getEndTime()));

		EnumMap<SlotType, Float> totalHours = new EnumMap<>(SlotType.class);
		modifySlotsStartEndTimeToCalculateWorkBreakHours(timeRecord, timeRequest, totalHours);

		timeRequest.setWorkHours(totalHours.get(SlotType.WORK));
		timeRequest.setBreakHours(totalHours.get(SlotType.BREAK));

		return timeRequest;
	}

	/**
	 * based on the request type, total hours of work and break is calculated
	 * @param timeRecord associated with the request
	 * @param request entity prepared to be saved on successful calculation
	 * @param totalHoursByType hashmap that will hold the calculated value based on the
	 * slot type
	 */
	private void modifySlotsStartEndTimeToCalculateWorkBreakHours(TimeRecord timeRecord, TimeRequest request,
			EnumMap<SlotType, Float> totalHoursByType) {
		totalHoursByType.put(SlotType.WORK, 0f);
		totalHoursByType.put(SlotType.BREAK, 0f);

		if (request.getRequestType().equals(RequestType.EDIT_RECORD_REQUEST)) {
			calculateHoursForEditRequest(timeRecord, request, totalHoursByType);
		}
		else if (request.getRequestType().equals(RequestType.MANUAL_ENTRY_REQUEST)) {
			float workHoursAfterCap = (request.getRequestedStartTime().compareTo(request.getRequestedEndTime()) != 0)
					? ((request.getRequestedEndTime() - request.getRequestedStartTime()) / MILLISECONDS_IN_AN_HOUR) : 0;
			totalHoursByType.put(SlotType.WORK, workHoursAfterCap);
			if (request.getTimeRecord() != null)
				calculateHoursForManualEntry(timeRecord, request, totalHoursByType);
		}
	}

	/**
	 * for Clock In Out Edit Requests when approved, some existing slots of the record
	 * might be removed by the request, and some slots might be capped (expand/shrink)
	 * those will be considered and calculated accordingly
	 * @param timeRecord associated with the request
	 * @param request entity prepared to be saved on successful calculation
	 * @param totalHoursByType hashmap that will hold the calculated value based on the
	 * slot type
	 */
	private void calculateHoursForEditRequest(TimeRecord timeRecord, TimeRequest request,
			EnumMap<SlotType, Float> totalHoursByType) {
		float workHoursAfterCap = 0f;
		float breakHoursAfterCap = 0f;

		// returns only the slots that is inside new clock in and out & the slots those
		// will be capped
		List<TimeSlot> slotsInsideNewClockInOut = new ArrayList<>(timeSlotDao.getFullyAndPartiallyOverlappingSlots(
				timeRecord.getTimeRecordId(), request.getRequestedStartTime(), request.getRequestedEndTime()));

		Optional<TimeSlot> activeSlot = timeSlotDao.findByTimeRecordAndIsActiveRightNow(timeRecord, true);
		if (activeSlot.isPresent()) {
			TimeSlot slot = activeSlot.get();
			Long slotEndTime = slot.getEndTime();
			if (slot.getStartTime() < request.getRequestedEndTime()
					&& (slotEndTime == null || slotEndTime > request.getRequestedStartTime())) {
				slotsInsideNewClockInOut.add(slot);
				slotsInsideNewClockInOut.sort((a, b) -> Long.compare(a.getStartTime(), b.getStartTime()));
			}
		}

		if (slotsInsideNewClockInOut.isEmpty())
			workHoursAfterCap = timeRecord.getWorkedHours();
		else {
			boolean isClockInExpanding = (request.getRequestedStartTime() < slotsInsideNewClockInOut.getFirst()
				.getStartTime());
			boolean isClockOutExpanding = (slotsInsideNewClockInOut.getLast().getEndTime() == null
					|| request.getRequestedEndTime() > slotsInsideNewClockInOut.getLast().getEndTime());
			TimeSlot firstSlot = slotsInsideNewClockInOut.getFirst();
			TimeSlot lastSlot = slotsInsideNewClockInOut.getLast();
			Long initialStartTime = firstSlot.getStartTime();
			Long initialEndTime = lastSlot.getEndTime();

			if (isClockInExpanding) {
				firstSlot.setStartTime(request.getRequestedStartTime());
				slotsInsideNewClockInOut.set(0, firstSlot);
			}
			if (isClockOutExpanding) {
				lastSlot.setEndTime(request.getRequestedEndTime());
				slotsInsideNewClockInOut.set(slotsInsideNewClockInOut.size() - 1, lastSlot);
			}

			for (TimeSlot slot : slotsInsideNewClockInOut) {
				float timeGap = slotDurationAfterModifyInEditRequest(request, slot);
				if (Objects.requireNonNull(slot.getSlotType()) == SlotType.WORK) {
					workHoursAfterCap = workHoursAfterCap + timeGap;
				}
				else if (slot.getSlotType() == SlotType.BREAK) {
					breakHoursAfterCap = breakHoursAfterCap + timeGap;
				}
			}

			if (!Objects.equals(firstSlot.getStartTime(), initialStartTime))
				firstSlot.setStartTime(initialStartTime);
			if (!Objects.equals(lastSlot.getEndTime(), initialEndTime))
				lastSlot.setEndTime(initialEndTime);
		}
		totalHoursByType.put(SlotType.WORK, workHoursAfterCap);
		totalHoursByType.put(SlotType.BREAK, breakHoursAfterCap);
	}

	private float slotDurationAfterModifyInEditRequest(TimeRequest request, TimeSlot slot) {
		Long startTime = slot.getStartTime();
		Long endTime = slot.getEndTime() != null ? slot.getEndTime() : request.getRequestedEndTime();
		if (!(request.getRequestedStartTime() < slot.getStartTime() && request.getRequestedEndTime() > endTime)) {
			if (slot.getStartTime() < request.getRequestedStartTime())
				startTime = request.getRequestedStartTime();
			if (endTime > request.getRequestedEndTime())
				endTime = request.getRequestedEndTime();
		}
		return (startTime.compareTo(endTime) != 0) ? ((endTime - startTime) / MILLISECONDS_IN_AN_HOUR) : 0;
	}

	private void validateTimeRequestToSave(TimeRequest timeRequestToSave) {

		EmployeeTimeRequestFilterDto filterDto = new EmployeeTimeRequestFilterDto();
		filterDto.setRecordId(
				timeRequestToSave.getTimeRecord() != null ? timeRequestToSave.getTimeRecord().getTimeRecordId() : null);
		filterDto.setRequestType(timeRequestToSave.getRequestType());
		filterDto.setStartTime(timeRequestToSave.getRequestedStartTime());
		filterDto.setEndTime(timeRequestToSave.getRequestedEndTime());
		filterDto.setStatus(List.of(RequestStatus.PENDING));
		List<TimeRequest> duplicateRequests = timeRequestDao.findTimeRequestsByOptionalFilters(filterDto);
		if (!duplicateRequests.isEmpty()) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_FOUND_OVERLAPPING_REQUESTS);
		}
	}

	private void calculateHoursForManualEntry(TimeRecord timeRecord, TimeRequest request,
			EnumMap<SlotType, Float> totalHoursByType) {
		float workHoursAfterCap = totalHoursByType.get(SlotType.WORK);
		float breakHoursAfterCap = totalHoursByType.get(SlotType.BREAK);

		// returns only the slots that will _not_ be replaced and the slots those will be
		// capped
		List<TimeSlot> slotsOutsideManualEntry = timeSlotDao.getNotFullyOverlappingSlots(timeRecord.getTimeRecordId(),
				request.getRequestedStartTime(), request.getRequestedEndTime());

		for (TimeSlot slot : slotsOutsideManualEntry) {
			float timeGap = slotDurationAfterModifyInManualEntry(request, slot);
			if (Objects.requireNonNull(slot.getSlotType()) == SlotType.WORK) {
				workHoursAfterCap = workHoursAfterCap + timeGap;
			}
			else if (slot.getSlotType() == SlotType.BREAK) {
				breakHoursAfterCap = breakHoursAfterCap + timeGap;
			}
		}

		totalHoursByType.put(SlotType.WORK, workHoursAfterCap);
		totalHoursByType.put(SlotType.BREAK, breakHoursAfterCap);
	}

	private float slotDurationAfterModifyInManualEntry(TimeRequest request, TimeSlot slot) {
		Long startTime = slot.getStartTime();
		Long endTime = slot.getEndTime();

		boolean isRequestedStartTimeInBetween = (request.getRequestedStartTime() > slot.getStartTime()
				&& request.getRequestedStartTime() < slot.getEndTime());
		boolean isRequestedEndTimeInBetween = (request.getRequestedEndTime() > slot.getStartTime()
				&& request.getRequestedEndTime() < slot.getEndTime());

		// Only Slots those will be capped should enter this condition block
		if (isRequestedStartTimeInBetween || isRequestedEndTimeInBetween) {
			if (slot.getStartTime() < request.getRequestedStartTime()
					&& slot.getEndTime() < request.getRequestedEndTime())
				endTime = request.getRequestedStartTime();
			else if (slot.getStartTime() > request.getRequestedStartTime()
					&& slot.getEndTime() > request.getRequestedEndTime())
				startTime = request.getRequestedEndTime();
		}

		return (startTime.compareTo(endTime) != 0) ? ((endTime - startTime) / MILLISECONDS_IN_AN_HOUR) : 0;
	}

	private boolean validateDateTime(TimeRecord timeRecord, UpdateIncompleteTimeRecordsRequestDto requestDto) {
		LocalDateTime endDate = requestDto.getClockOutTime();
		LocalDate startDate = timeRecord.getDate();
		return startDate.isEqual(ChronoLocalDate.from(endDate));
	}

	private void updateWorkHours(TimeRecord timeRecord, TimeSlot slot, SlotType slotType) {
		LocalDateTime startTime = DateTimeUtils.epochMillisToUtcLocalDateTime(slot.getStartTime(), null);
		LocalDateTime endTime = DateTimeUtils.epochMillisToUtcLocalDateTime(slot.getEndTime(), null);

		float workHours = CommonModuleUtils.calculateHoursBetweenEpochMillis(
				startTime.toInstant(ZoneOffset.UTC).toEpochMilli(), endTime.toInstant(ZoneOffset.UTC).toEpochMilli());
		float hours;
		if (slotType.equals(SlotType.WORK)) {
			hours = timeRecord.getWorkedHours() + workHours;
			timeRecord.setWorkedHours(hours);
		}
		else {
			hours = timeRecord.getBreakHours() + workHours;
			timeRecord.setBreakHours(hours);
		}
	}

	public Float getWorkedHoursForDateRange(LocalDate startDate, LocalDate endDate, List<Long> employeeIds) {
		AttendanceSummaryDto attendanceSummaryDto = timeRecordDao.getEmployeeAttendanceSummary(employeeIds, startDate,
				endDate);
		return attendanceSummaryDto.getTotalWorkHours();
	}

	private void recordClockInAndClockOut(User currentUser, long timeInMillis, TimeRecordActionTypes actionType) {
		log.info("recordClockInAndClockOut: execution started by user: {}", currentUser.getUserId());
		Optional<TimeRecord> timeRecord = timeRecordDao.findByEmployeeAndDate(currentUser.getEmployee(),
				DateTimeUtils.epochMillisToUtcLocalDate(timeInMillis));

		if (actionType == TimeRecordActionTypes.START) {
			if (timeRecord.isPresent()) {
				log.info("recordClockInAndClockOut: clock in already exists for user: {}", currentUser.getUserId());
				throw new ModuleException(TimeMessageConstant.TIME_ERROR_TIME_CLOCK_IN_EXISTS_FOR_CURRENT_DATE);
			}

			TimeRecord newTimeRecord = timeMapper.newTimeRecordToTimeRecord(currentUser.getEmployee(), timeInMillis,
					CommonModuleUtils.getDayOfWeek(DateTimeUtils.getLocalDateFromEpoch(timeInMillis)),
					DateTimeUtils.epochMillisToUtcLocalDate(timeInMillis));
			timeRecordDao.save(newTimeRecord);
			createTimeSlot(newTimeRecord, timeInMillis, TimeRecordActionTypes.START);
			Employee currentEmployee = currentUser.getEmployee();
			currentEmployee.setLastClockInDate(DateTimeUtils.epochMillisToUtcLocalDate(timeInMillis));
			employeeDao.save(currentEmployee);
		}
		else {
			if (timeRecord.isEmpty()) {
				log.info("recordClockOut: no clock in found for user: {}", currentUser.getUserId());
				throw new ModuleException(TimeMessageConstant.TIME_ERROR_CLOCK_IN_NOT_EXISTS_FOR_CURRENT_DATE);
			}
			timeRecord.get().setClockOutTime(timeInMillis);
			timeRecord.get().setCompleted(true);
			timeRecordDao.save(timeRecord.get());
			createTimeSlot(timeRecord.get(), timeInMillis, TimeRecordActionTypes.END);
		}
	}

	private void createTimeSlot(TimeRecord timeRecord, long timeInMillis, TimeRecordActionTypes actionType) {
		List<TimeSlot> timeSlotsToSave = new ArrayList<>();

		inactiveLastActivateTimeSlot(timeRecord, timeInMillis, timeSlotsToSave);
		if (actionType != TimeRecordActionTypes.END) {
			SlotType slotType = (actionType == TimeRecordActionTypes.RESUME
					|| actionType == TimeRecordActionTypes.START) ? SlotType.WORK : SlotType.BREAK;
			TimeSlot timeSlot = timeMapper.newTimeSlotToTimeSlot(timeInMillis, slotType, true, timeRecord, false);
			timeSlotsToSave.add(timeSlot);
		}
		timeSlotDao.saveAll(timeSlotsToSave);
	}

	private void inactiveLastActivateTimeSlot(TimeRecord timeRecord, long timeInMillis,
			List<TimeSlot> timeSlotsToSave) {
		Optional<TimeSlot> existingActiveTimeSlot = timeSlotDao.findByTimeRecordAndIsActiveRightNow(timeRecord, true);
		if (existingActiveTimeSlot.isPresent()) {
			existingActiveTimeSlot.get().setActiveRightNow(false);
			existingActiveTimeSlot.get().setEndTime(timeInMillis);
			timeSlotsToSave.add(existingActiveTimeSlot.get());

			calculateWorkedHours(timeRecord, existingActiveTimeSlot.get(), timeInMillis);
		}
	}

	private void calculateWorkedHours(TimeRecord timeRecord, TimeSlot currentTimeSlot, long timeInMillis) {
		float hours = CommonModuleUtils.calculateHoursBetweenEpochMillis(currentTimeSlot.getStartTime(), timeInMillis);

		if (currentTimeSlot.getSlotType() == SlotType.WORK) {
			timeRecord.setWorkedHours(timeRecord.getWorkedHours() + hours);
		}
		else if (currentTimeSlot.getSlotType() == SlotType.BREAK) {
			timeRecord.setBreakHours(timeRecord.getBreakHours() + hours);
		}

		timeRecordDao.save(timeRecord);
	}

	private void validateRequestParameters(TimeRequestDto timeRequestDto) throws ModuleException {
		if (timeRequestDto.getEndTime().isBefore(timeRequestDto.getStartTime())) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_END_TIME_BEFORE_START_TIME);
		}

		Set<String> allZoneIds = ZoneId.getAvailableZoneIds();
		if (!allZoneIds.contains(timeRequestDto.getZoneId())) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_ZONE_ID_IS_INVALID);
		}

		ZoneId zoneId = ZoneId.of(timeRequestDto.getZoneId());

		ZonedDateTime startTimeWithZone = timeRequestDto.getStartTime().atZone(zoneId);
		ZonedDateTime endTimeWithZone = timeRequestDto.getEndTime().atZone(zoneId);

		if (!startTimeWithZone.toLocalDate().isEqual(endTimeWithZone.toLocalDate())) {
			throw new ModuleException(TimeMessageConstant.TIME_ERROR_START_END_TIME_DIFFERENT_DATES);
		}
	}

	private void setRemovingTimeConfigs(List<TimeConfig> currentTimeConfigs,
			Set<TimeConfigDto.DayCapacity> dayCapacities) {

		List<LeaveRequest> futureLeaves = new ArrayList<>();

		List<TimeConfig> removingConfigs = currentTimeConfigs.stream()
			.filter(timeConfig -> dayCapacities.stream()
				.noneMatch(dayCapacity -> timeConfig.getDay().name().equals(dayCapacity.day().name())))
			.toList();
		removingConfigs.forEach(timeConfig -> futureLeaves
			.addAll(leaveRequestDao.findAllFutureLeaveRequestsForTheDay(timeConfig.getDay())));
		if (!futureLeaves.isEmpty()) {
			futureLeaves.forEach(leaveRequest -> {
				leaveRequest.setStatus(leaveRequest.getStatus().equals(LeaveRequestStatus.PENDING)
						? LeaveRequestStatus.CANCELLED : LeaveRequestStatus.REVOKED);
				leaveRequestDao.save(leaveRequest);
				updateLeaveEntitlement(leaveRequest);
				handleCalendarEventsDeletion(leaveRequest);
				if (leaveRequest.getEndDate().equals(leaveRequest.getStartDate())) {
					if (leaveRequest.getStatus() == LeaveRequestStatus.PENDING) {
						timeEmailService.sendNonWorkingDaySingleDayPendingLeaveRequestCancelEmployeeEmail(leaveRequest);
						attendanceNotificationService
							.sendNonWorkingDaySingleDayPendingLeaveRequestCancelEmployeeNotification(leaveRequest);

						timeEmailService.sendNonWorkingDaySingleDayPendingLeaveRequestCancelManagerEmail(leaveRequest);
						attendanceNotificationService
							.sendNonWorkingDaySingleDayPendingLeaveRequestCancelManagerNotification(leaveRequest);
					}
					else if (leaveRequest.getStatus() == LeaveRequestStatus.APPROVED) {
						timeEmailService
							.sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedEmployeeEmail(leaveRequest);
						attendanceNotificationService
							.sendNonWorkingDaySingleLeaveRequestRevokedEmployeeNotification(leaveRequest);

						timeEmailService
							.sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedManagerEmail(leaveRequest);
						attendanceNotificationService
							.sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedManagerNotification(leaveRequest);
					}
				}
				else {
					if (leaveRequest.getStatus() == LeaveRequestStatus.PENDING) {
						timeEmailService.sendNonWorkingDayMultiDayPendingLeaveRequestCancelEmployeeEmail(leaveRequest,
								removingConfigs);
						attendanceNotificationService
							.sendNonWorkingDayMultiDayPendingLeaveRequestCancelEmployeeNotification(leaveRequest);

						timeEmailService.sendNonWorkingDayMultiDayPendingLeaveRequestCancelManagerEmail(leaveRequest,
								removingConfigs);
						attendanceNotificationService
							.sendNonWorkingDayMultiDayPendingLeaveRequestCancelManagerNotification(leaveRequest,
									removingConfigs);
					}
					else if (leaveRequest.getStatus() == LeaveRequestStatus.APPROVED) {
						timeEmailService
							.sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedEmployeeEmail(leaveRequest);
						attendanceNotificationService
							.sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedEmployeeNotification(leaveRequest);

						timeEmailService.sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedManagerEmail(leaveRequest);
						attendanceNotificationService
							.sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedManagerNotification(leaveRequest);
					}
				}

			});
		}
		timeConfigDao.deleteAll(removingConfigs);
		currentTimeConfigs.removeAll(removingConfigs);

	}

	private void updateLeaveEntitlement(LeaveRequest leaveRequest) {
		List<LeaveRequestEntitlement> leaveRequestEntitlement = leaveRequestEntitlementDao
			.findAllByLeaveRequest(leaveRequest);
		if (leaveRequestEntitlement != null) {
			Optional<LeaveEntitlement> optionalLeaveEntitlement = leaveEntitlementDao
				.findById(leaveRequestEntitlement.getFirst().getLeaveEntitlement().getEntitlementId());
			if (optionalLeaveEntitlement.isPresent()) {
				LeaveEntitlement leaveEntitlement = optionalLeaveEntitlement.get();
				leaveEntitlement.setTotalDaysUsed(leaveEntitlement.getTotalDaysUsed() - leaveRequest.getDurationDays());
			}
		}
	}

	private void handleTimeSheetSummary(TeamTimeRecordSummaryResponseDto teamTimeRecordSummaryResponseDto,
			LocalDate startDate, LocalDate endDate, List<LeaveRequest> leaveRequests, List<Holiday> holidays,
			List<Long> employeeIds, TeamTimeRecordFilterDto timeRecordSummaryDto) {
		if (Boolean.TRUE.equals(timeRecordSummaryDto.getIsExport())) {
			TimeRecordsSummary timeRecordsSummary = new TimeRecordsSummary();
			timeRecordsSummary.setStartDate(startDate);
			timeRecordsSummary.setEndDate(endDate);
			timeRecordsSummary.setLeaves(leaveRequests.size());
			timeRecordsSummary.setHolidays(holidays.size());

			TimeSheetSummaryData timeSheetSummaryData = timeRecordDao.findTimeSheetSummaryData(startDate, endDate,
					employeeIds);
			timeRecordsSummary.setWorkedHours(timeSheetSummaryData.getWorkedHours());

			SimpleDateFormat sdf = new SimpleDateFormat("hh:mm a");
			timeRecordsSummary.setAverageClockInTime(
					sdf.format(new java.util.Date(timeSheetSummaryData.getAverageClockInTime().longValue())));
			timeRecordsSummary.setAverageClockOutTime(
					sdf.format(new java.util.Date(timeSheetSummaryData.getAverageClockOutTime().longValue())));

			teamTimeRecordSummaryResponseDto.setTimeRecordsSummary(timeRecordsSummary);
		}
	}

	/**
	 * Delete corresponding 'out of office' event related to the leave request. This
	 * feature is available only for Pro tenants.
	 * @param leaveRequest The leave request to be updated.
	 */
	protected void handleCalendarEventsDeletion(LeaveRequest leaveRequest) {
		// This feature is available only for Pro tenants.
	}

}
