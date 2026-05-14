package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.payload.response.BulkStatusSummary;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.WorkLocationDao;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.model.LeaveRequestEntitlement;
import com.skapp.community.leaveplanner.payload.LeaveRequestFilterDto;
import com.skapp.community.leaveplanner.repository.LeaveEntitlementDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestEntitlementDao;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.peopleplanner.constant.PeopleConstants;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.payload.request.HolidayBulkRequestDto;
import com.skapp.community.peopleplanner.payload.request.HolidayFilterDto;
import com.skapp.community.peopleplanner.payload.request.HolidayRequestDto;
import com.skapp.community.peopleplanner.payload.request.HolidaysDeleteRequestDto;
import com.skapp.community.peopleplanner.payload.response.HolidayBulkSaveResponseDto;
import com.skapp.community.peopleplanner.payload.response.HolidayDtoStatusResponseDto;
import com.skapp.community.peopleplanner.payload.response.HolidayResponseDto;
import com.skapp.community.peopleplanner.payload.response.HolidayWorkLocationResponseDto;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.service.HolidayService;
import com.skapp.community.peopleplanner.service.PeopleEmailService;
import com.skapp.community.peopleplanner.service.PeopleNotificationService;
import com.skapp.community.peopleplanner.type.BulkRecordStatus;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class HolidayServiceImpl implements HolidayService {

	private final MessageUtil messageUtil;

	private final PeopleMapper peopleMapper;

	private final HolidayDao holidayDao;

	private final PageTransformer pageTransformer;

	private final TimeConfigDao timeConfigDao;

	private final LeaveRequestDao leaveRequestDao;

	private final LeaveRequestEntitlementDao leaveRequestEntitlementDao;

	private final LeaveEntitlementDao leaveEntitlementDao;

	private final PeopleEmailService peopleEmailService;

	private final PeopleNotificationService peopleNotificationService;

	private final OrganizationService organizationService;

	private final WorkLocationDao workLocationDao;

	@Override
	public ResponseEntityDto getAllHolidays(HolidayFilterDto holidayFilterDto) {
		log.info("getAllHolidays: execution started");

		int pageSize = holidayFilterDto.getSize();
		Boolean isExport = holidayFilterDto.getIsExport();
		if (Boolean.TRUE.equals(isExport)) {
			pageSize = (int) holidayDao.count();
		}

		Pageable pageable = PageRequest.of(holidayFilterDto.getPage(), pageSize,
				Sort.by(holidayFilterDto.getSortOrder(), holidayFilterDto.getSortKey().toString()));

		Page<Holiday> holidays = holidayDao.findAllHolidays(holidayFilterDto, pageable);
		PageDto pageDto = pageTransformer.transform(holidays);
		List<HolidayResponseDto> list = peopleMapper
			.holidaysToHolidayResponseDtoList(holidays.hasContent() ? holidays.getContent() : Collections.emptyList());

		list.forEach(this::normalizeWorkLocations);

		pageDto.setItems(list);

		log.info("getAllHolidays: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	public ResponseEntityDto saveBulkHolidays(HolidayBulkRequestDto holidayBulkRequestDto) {
		log.info("saveBulkHolidays: execution started");

		List<HolidayDtoStatusResponseDto> holidayDtoStatusList = new ArrayList<>();
		List<Holiday> savableHolidays = new ArrayList<>();
		AtomicInteger holidaysOnCurrentDate = new AtomicInteger();
		AtomicInteger holidaysOnPastDates = new AtomicInteger();

		List<WorkLocation> allWorkLocations = workLocationDao.findAll();
		List<String> validWorkLocationNames = allWorkLocations.stream().map(WorkLocation::getName).toList();
		Map<String, WorkLocation> workLocationsByName = allWorkLocations.stream()
			.collect(Collectors.toMap(wl -> wl.getName().trim(), wl -> wl, (a, b) -> a));

		holidayBulkRequestDto.getHolidayDtoList().forEach(holidayDto -> {
			try {

				LocalDate holidayDate = DateTimeUtils.parseUtcDate(holidayDto.getDate());
				List<Holiday> systemHolidays = holidayDao.findAllByIsActiveTrueAndDate(holidayDate);

				validateHolidayDto(holidayDto, holidayDate, systemHolidays, holidaysOnCurrentDate, holidaysOnPastDates,
						holidayBulkRequestDto.getYear(), validWorkLocationNames);

				Holiday holiday = peopleMapper.holidayDtoToHoliday(holidayDto);

				Set<WorkLocation> workLocations = resolveWorkLocations(holidayDto.getWorkLocations(),
						workLocationsByName);
				holiday.setWorkLocations(workLocations);

				savableHolidays.add(holiday);

				LeaveRequestFilterDto leaveRequestFilterDto = new LeaveRequestFilterDto();
				leaveRequestFilterDto.setEndDate(holidayDate);
				leaveRequestFilterDto.setStartDate(holidayDate);
				List<LeaveRequest> leaveRequests = leaveRequestDao
					.findAllLeaveRequestsByDateRange(leaveRequestFilterDto);
				if (systemHolidays.isEmpty() && !leaveRequests.isEmpty()) {
					leaveRequests.forEach(leaveRequest -> updateLeaveRequestDueHoliday(holiday, leaveRequest));
				}
			}
			catch (ModuleException | DateTimeParseException e) {
				log.warn("saveBulkHolidays: Found a record with error: {}", e.getMessage());
				holidayDtoStatusList
					.add(new HolidayDtoStatusResponseDto(BulkRecordStatus.ERROR, e.getMessage(), holidayDto));
			}
		});

		List<Holiday> savedHolidays = holidayDao.saveAll(savableHolidays);
		if (savedHolidays.size() == 1) {
			peopleEmailService.sendNewHolidayDeclarationEmail(savedHolidays.getFirst());
			peopleNotificationService.sendNewHolidayDeclarationNotification(savedHolidays.getFirst());
		}

		HolidayBulkSaveResponseDto responseDto = getHolidayBulkUploadResponseSummaryText(
				holidayBulkRequestDto.getHolidayDtoList().size(), savableHolidays.size(),
				holidaysOnCurrentDate.get() > 0, holidaysOnPastDates.get() > 0, holidayDtoStatusList);

		log.info("saveBulkHolidays: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto getHolidaysByDate(LocalDate date) {
		log.info("getHolidayByDate: execution started");

		List<Holiday> holidayList = holidayDao.findAllActiveHolidaysByDateWithWorkLocations(date);
		List<TimeConfig> workingDays = timeConfigDao.findAll();

		List<HolidayResponseDto> holidayResponseDtos = new ArrayList<>();
		if (!workingDays.isEmpty() && !CommonModuleUtils.checkIfDayIsWorkingDay(date, workingDays,
				organizationService.getOrganizationTimeZone())) {
			HolidayResponseDto holiday = new HolidayResponseDto();
			holiday.setDate(date);
			holiday.setName("Day Off!");
			holidayResponseDtos.add(holiday);
		}

		if (!holidayList.isEmpty()) {
			List<HolidayResponseDto> mappedHolidays = peopleMapper.holidaysToHolidayResponseDtoList(holidayList);
			mappedHolidays.forEach(this::normalizeWorkLocations);
			holidayResponseDtos.addAll(mappedHolidays);
		}

		log.info("getHolidayByDate: execution ended");
		return new ResponseEntityDto(false, holidayResponseDtos);
	}

	@Override
	@Transactional(propagation = Propagation.REQUIRED)
	public ResponseEntityDto deleteAllHolidays(int year) {
		log.info("deleteAllHolidays: execution started");

		List<Holiday> holidays = holidayDao.findAll()
			.stream()
			.filter(holiday -> holiday.getDate().getYear() == year)
			.toList();

		holidays.forEach(holiday -> {
			if (hasLeaveRequestsForDate(holiday.getDate())) {
				throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_CANNOT_BE_DELETED_LEAVES_EXIST);
			}
		});

		List<Long> deletedHolidayIds = holidays.stream().filter(this::canDeleteHoliday).map(Holiday::getId).toList();
		holidayDao.deleteAllById(deletedHolidayIds);

		return new ResponseEntityDto(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_DELETE_HOLIDAYS),
				false);
	}

	@Override
	@Transactional(propagation = Propagation.REQUIRED)
	public ResponseEntityDto deleteSelectedHolidays(HolidaysDeleteRequestDto holidayDeleteDto) {
		log.info("deleteSelectedHolidays: execution started");

		if (holidayDeleteDto.getHolidayIds() == null || holidayDeleteDto.getHolidayIds().isEmpty()) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_DELETE_HOLIDAYS_ARRAY_EMPTY);
		}

		List<Long> holidayIds = holidayDeleteDto.getHolidayIds();
		for (Long holidayId : holidayIds) {
			Optional<Holiday> optionalHoliday = holidayDao.findById(holidayId);

			if (optionalHoliday.isPresent()) {
				Holiday holiday = optionalHoliday.get();
				if (!holiday.isActive()) {
					throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SPECIFIC_HOLIDAY_NOT_FOUND,
							new String[] { String.valueOf(holidayId) });
				}
				LeaveRequestFilterDto leaveRequestFilterDto = new LeaveRequestFilterDto();
				leaveRequestFilterDto.setStartDate(holiday.getDate());
				leaveRequestFilterDto.setEndDate(holiday.getDate());
				leaveRequestFilterDto.setStatus(List.of(LeaveRequestStatus.PENDING, LeaveRequestStatus.APPROVED));
				List<LeaveRequest> leaveRequests = leaveRequestDao
					.findAllLeaveRequestsByDateRange(leaveRequestFilterDto);
				if (!leaveRequests.isEmpty()) {
					throw new ModuleException(
							PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_CANNOT_BE_DELETED_LEAVES_EXIST);
				}

				if (canDeleteHoliday(holiday)) {
					holiday.setActive(false);
					log.info("Deleted holiday with ID: {}", holidayId);
				}
				else {
					throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_CANNOT_BE_DELETED);
				}
			}
			else {
				throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SPECIFIC_HOLIDAY_NOT_FOUND,
						new String[] { String.valueOf(holidayId) });
			}
		}

		return new ResponseEntityDto(
				messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_DELETE_SELECTED_HOLIDAYS), false);
	}

	private void updateLeaveRequestDueHoliday(Holiday holiday, LeaveRequest leaveRequest) {
		boolean isMultiple = isMultipleDaysLeave(leaveRequest);
		boolean isFullDayHoliday = holiday.getHolidayDuration() == HolidayDuration.FULL_DAY;
		boolean isHalfDayMorningHoliday = holiday.getHolidayDuration() == HolidayDuration.HALF_DAY_MORNING;
		boolean isHalfDayEveningHoliday = holiday.getHolidayDuration() == HolidayDuration.HALF_DAY_EVENING;

		if (isFullDayHoliday) {
			if (!isMultiple) {
				if (leaveRequest.getStatus() == LeaveRequestStatus.PENDING
						|| leaveRequest.getStatus() == LeaveRequestStatus.APPROVED) {
					leaveRequest.setStatus(leaveRequest.getStatus() == LeaveRequestStatus.PENDING
							? LeaveRequestStatus.CANCELLED : LeaveRequestStatus.REVOKED);
				}
			}
			else {
				leaveRequest.setDurationDays(leaveRequest.getDurationDays() - 1);
			}
		}
		else {
			boolean isSingleDayHalfDayLeave = !isMultiple && leaveRequest.getLeaveState() == LeaveState.HALFDAY_MORNING
					|| leaveRequest.getLeaveState() == LeaveState.HALFDAY_EVENING;

			if (isSingleDayHalfDayLeave) {
				if ((isHalfDayMorningHoliday && leaveRequest.getLeaveState() == LeaveState.HALFDAY_MORNING)
						|| (isHalfDayEveningHoliday && leaveRequest.getLeaveState() == LeaveState.HALFDAY_EVENING)) {

					leaveRequest.setStatus(leaveRequest.getStatus() == LeaveRequestStatus.PENDING
							? LeaveRequestStatus.CANCELLED : LeaveRequestStatus.REVOKED);
				}
			}
			else if (isMultiple) {
				leaveRequest.setDurationDays((float) (leaveRequest.getDurationDays() - 0.5));
			}
		}

		leaveRequest = leaveRequestDao.save(leaveRequest);

		sendEmailsAndNotifications(leaveRequest, isMultiple, holiday);

		List<LeaveRequestEntitlement> leaveRequestEntitlements = leaveRequestEntitlementDao
			.findAllByLeaveRequestOrderByLeaveEntitlement_ValidToAsc(leaveRequest);

		if (!leaveRequestEntitlements.isEmpty()) {
			deductDaysUsed(leaveRequestEntitlements.getFirst(),
					leaveRequestEntitlements.getFirst().getLeaveEntitlement());
		}
		else {
			log.warn("No LeaveRequestEntitlements found for LeaveRequest ID: {}", leaveRequest.getLeaveRequestId());
		}
	}

	private void sendEmailsAndNotifications(LeaveRequest leaveRequest, boolean isMultiple, Holiday holiday) {
		if (leaveRequest.getStatus() == LeaveRequestStatus.CANCELLED) {
			if (isMultiple) {
				peopleEmailService.sendHolidayMultipleDayPendingLeaveRequestUpdatedEmployeeEmail(leaveRequest, holiday);
				peopleNotificationService
					.sendHolidayMultipleDayPendingLeaveRequestUpdatedEmployeeNotification(leaveRequest, holiday);

				peopleEmailService.sendHolidayMultipleDayApprovedLeaveRequestUpdatedManagerEmail(leaveRequest, holiday);
				peopleNotificationService.sendHolidayMultipleDayApprovedLeaveRequestUpdatedManagerEmail(leaveRequest,
						holiday);
			}
			else {
				peopleEmailService.sendHolidaySingleDayPendingLeaveRequestCancellationEmployeeEmail(leaveRequest,
						holiday);
				peopleNotificationService
					.sendHolidaySingleDayPendingLeaveRequestCancellationEmployeeNotification(leaveRequest, holiday);

				peopleEmailService.sendHolidaySingleDayPendingLeaveRequestCancellationManagerEmail(leaveRequest,
						holiday);
				peopleNotificationService
					.sendHolidaySingleDayPendingLeaveRequestCancellationManagerNotification(leaveRequest, holiday);
			}
		}
		else if (leaveRequest.getStatus() == LeaveRequestStatus.REVOKED) {
			if (isMultiple) {
				peopleEmailService.sendHolidayMultipleDayApprovedLeaveRequestUpdatedEmployeeEmail(leaveRequest,
						holiday);
				peopleNotificationService
					.sendHolidayMultipleDayApprovedLeaveRequestUpdatedEmployeeNotification(leaveRequest, holiday);

				peopleEmailService.sendHolidayMultipleDayPendingLeaveRequestUpdatedManagerEmail(leaveRequest, holiday);
				peopleNotificationService
					.sendHolidayMultipleDayPendingLeaveRequestUpdatedManagerNotification(leaveRequest, holiday);
			}
			else {
				peopleEmailService.sendHolidaySingleDayApprovedLeaveRequestRevokedEmployeeEmail(leaveRequest, holiday);
				peopleNotificationService
					.sendHolidaySingleDayApprovedLeaveRequestRevokedEmployeeNotification(leaveRequest, holiday);

				peopleEmailService.sendHolidaySingleDayApprovedLeaveRequestRevokedManagerEmail(leaveRequest, holiday);
				peopleNotificationService
					.sendHolidaySingleDayApprovedLeaveRequestRevokedManagerNotification(leaveRequest, holiday);
			}
		}
	}

	private void deductDaysUsed(LeaveRequestEntitlement leaveRequestEntitlement, LeaveEntitlement leaveEntitlement) {
		float daysUsed = leaveRequestEntitlement.getDaysUsed();
		float totalDaysUsed = leaveEntitlement.getTotalDaysUsed();
		if (daysUsed > 0) {
			if (leaveRequestEntitlement.getDaysUsed() == 1) {
				leaveRequestEntitlementDao.delete(leaveRequestEntitlement);
			}
			else {
				leaveRequestEntitlement.setDaysUsed(daysUsed - 1);
				leaveRequestEntitlementDao.save(leaveRequestEntitlement);
			}
			leaveEntitlement.setTotalDaysUsed(totalDaysUsed - 1);
			leaveEntitlementDao.save(leaveEntitlement);
		}
	}

	private void validateHolidayDto(HolidayRequestDto holidayDto, LocalDate holidayDate, List<Holiday> systemHolidays,
			AtomicInteger holidaysOnCurrentDate, AtomicInteger holidaysOnPastDates, int year,
			List<String> validWorkLocationNames) {

		long overlappingHolidayCount = countOverlappingHolidays(systemHolidays, holidayDto.getWorkLocations());
		if (overlappingHolidayCount >= PeopleConstants.MAXIMUM_HOLIDAYS_PER_DAY) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_MAXIMUM_PER_DAY);
		}

		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();
		if (holidayDate == null) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_REQUIRED_DATE);
		}

		if (holidayDate.getYear() != year) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_INVALID_HOLIDAY_YEAR);
		}

		if (holidayDate.isEqual(currentDate)) {
			holidaysOnCurrentDate.getAndIncrement();
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_TODAY_NOT_ALLOWED);
		}
		if (holidayDate.isBefore(currentDate)) {
			holidaysOnPastDates.getAndIncrement();
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_PAST_DATE_NOT_ALLOWED);
		}

		if (holidayDto.getName() == null || holidayDto.getName().isEmpty()) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_NAME_REQUIRED);
		}
		if (holidayDto.getName().length() > PeopleConstants.HOLIDAY_NAME_MAX_LENGTH) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_NAME_CHAR_LIMIT);
		}
		if (!holidayDto.getName().matches(PeopleConstants.HOLIDAY_NAME_REGEX_PATTERN)) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_NAME_SPECIAL_CHAR);
		}

		HolidayDuration duration;
		try {
			duration = HolidayDuration.valueOf(holidayDto.getHolidayDuration());
		}
		catch (IllegalArgumentException ex) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_DURATION_INVALID);
		}

		if (!EnumSet.of(HolidayDuration.FULL_DAY, HolidayDuration.HALF_DAY_MORNING, HolidayDuration.HALF_DAY_EVENING)
			.contains(duration)) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_DURATION_INVALID);
		}

		// if (holidayDto.getWorkLocations() == null ||
		// holidayDto.getWorkLocations().isEmpty()) {
		// throw new
		// ModuleException(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_REQUIRED_WORK_LOCATION);
		// }

		if (holidayDto.getWorkLocations() != null && !holidayDto.getWorkLocations().isEmpty()) {
			validateWorkLocations(holidayDto.getWorkLocations(), validWorkLocationNames);
		}

	}

	private void validateWorkLocations(List<String> workLocationNames, List<String> validWorkLocationNames) {
		if (workLocationNames.stream().anyMatch(PeopleConstants.HOLIDAY_ALL_WORK_LOCATIONS::equals)) {
			return;
		}

		Set<String> validNames = validWorkLocationNames.stream().map(String::trim).collect(Collectors.toSet());

		workLocationNames.forEach(workLocation -> {
			if (!validNames.contains(workLocation.trim())) {
				throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_WORK_LOCATION_NOT_FOUND);
			}
		});
	}

	private HolidayBulkSaveResponseDto getHolidayBulkUploadResponseSummaryText(int inputListCount,
			int savedRecordsCount, boolean hasHolidayOnCurrentDate, boolean hasHolidayOnPastDates,
			List<HolidayDtoStatusResponseDto> holidayDtoStatusList) {
		String statusMessage;
		if (inputListCount == savedRecordsCount) {
			statusMessage = messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAYS_BULK_ADDED_SUCCESSFULLY);
		}
		else if (savedRecordsCount == 0) {
			if (hasHolidayOnCurrentDate)
				statusMessage = messageUtil
					.getMessage(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAYS_BULK_CANNOT_ADDED_IN_PAST_OR_CURRENT_DAY);
			else if (hasHolidayOnPastDates)
				statusMessage = messageUtil
					.getMessage(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAYS_BULK_CANNOT_ADDED_IN_PAST);
			else
				statusMessage = messageUtil
					.getMessage(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAY_BULK_FAILED_TO_ADD_ANY);
		}
		else {
			statusMessage = messageUtil
				.getMessage(PeopleMessageConstant.PEOPLE_ERROR_HOLIDAYS_BULK_ONLY_ADDED_FUTURE_DAYS);
		}

		BulkStatusSummary uploadStatus = new BulkStatusSummary(savedRecordsCount, inputListCount - savedRecordsCount);
		HolidayBulkSaveResponseDto holidayBulkSaveResponseDto = new HolidayBulkSaveResponseDto();
		holidayBulkSaveResponseDto.setMessage(statusMessage);
		holidayBulkSaveResponseDto.setBulkStatusSummary(uploadStatus);
		holidayBulkSaveResponseDto.setBulkRecordErrorLogs(holidayDtoStatusList);

		return holidayBulkSaveResponseDto;
	}

	private boolean hasLeaveRequestsForDate(LocalDate date) {
		LeaveRequestFilterDto leaveRequestFilterDto = new LeaveRequestFilterDto();
		leaveRequestFilterDto.setStartDate(date);
		leaveRequestFilterDto.setEndDate(date);

		List<LeaveRequest> leaveRequests = leaveRequestDao.findAllLeaveRequestsByDateRange(leaveRequestFilterDto);

		return !leaveRequests.isEmpty();
	}

	private boolean isMultipleDaysLeave(LeaveRequest leaveRequest) {
		LocalDate startDate = leaveRequest.getStartDate();
		LocalDate endDate = leaveRequest.getEndDate();
		return !startDate.equals(endDate);
	}

	private boolean canDeleteHoliday(Holiday holiday) {
		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();
		return holiday.getDate().isAfter(currentDate);
	}

	private Set<WorkLocation> resolveWorkLocations(List<String> workLocationNames,
			Map<String, WorkLocation> workLocationsByName) {
		if (workLocationNames == null || workLocationNames.isEmpty()) {
			return new HashSet<>();
		}

		if (workLocationNames.stream().anyMatch(PeopleConstants.HOLIDAY_ALL_WORK_LOCATIONS::equals)) {
			return new HashSet<>();
		}

		Set<WorkLocation> resolved = new HashSet<>();
		for (String name : workLocationNames) {
			WorkLocation wl = workLocationsByName.get(name.trim());
			if (wl != null) {
				resolved.add(wl);
			}
		}
		return resolved;
	}

	private void normalizeWorkLocations(HolidayResponseDto holidayResponseDto) {
		List<HolidayWorkLocationResponseDto> workLocations = holidayResponseDto.getWorkLocations();
		if (workLocations == null || workLocations.isEmpty()) {
			HolidayWorkLocationResponseDto allLocations = new HolidayWorkLocationResponseDto();
			allLocations.setName(PeopleConstants.HOLIDAY_ALL_WORK_LOCATIONS);
			allLocations.setWorkLocationId(PeopleConstants.HOLIDAY_ALL_WORK_LOCATIONS_ID);
			holidayResponseDto.setWorkLocations(Collections.singletonList(allLocations));
		}
	}

	private long countOverlappingHolidays(List<Holiday> systemHolidays, List<String> incomingWorkLocationNames) {
		if (systemHolidays.isEmpty()) {
			return 0;
		}

		boolean incomingIsAllLocations = incomingWorkLocationNames == null || incomingWorkLocationNames.isEmpty()
				|| incomingWorkLocationNames.stream().anyMatch(PeopleConstants.HOLIDAY_ALL_WORK_LOCATIONS::equals);

		if (incomingIsAllLocations) {
			return systemHolidays.size();
		}

		Set<String> incomingNames = incomingWorkLocationNames.stream().map(String::trim).collect(Collectors.toSet());

		return systemHolidays.stream().filter(existingHoliday -> {
			Set<WorkLocation> existingLocations = existingHoliday.getWorkLocations();
			if (existingLocations == null || existingLocations.isEmpty()) {
				return true;
			}
			return existingLocations.stream().map(WorkLocation::getName).anyMatch(incomingNames::contains);
		}).count();
	}

}
