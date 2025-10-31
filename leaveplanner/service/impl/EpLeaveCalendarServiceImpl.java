package com.skapp.enterprise.leaveplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.leaveplanner.util.LeaveModuleUtil;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.model.EmployeeCalendar;
import com.skapp.enterprise.common.repository.EmployeeCalendarDao;
import com.skapp.enterprise.common.service.EpGoogleCalenderService;
import com.skapp.enterprise.common.service.EpMicrosoftCalendarService;
import com.skapp.enterprise.common.service.impl.EpGoogleCalenderServiceImpl;
import com.skapp.enterprise.common.type.EpCalendarType;
import com.skapp.enterprise.leaveplanner.constant.EpLeaveMessageConstant;
import com.skapp.enterprise.leaveplanner.model.CalendarEvent;
import com.skapp.enterprise.leaveplanner.payload.EpWorkingHoursDto;
import com.skapp.enterprise.leaveplanner.payload.request.EpOutOfOfficeEventRequestDto;
import com.skapp.enterprise.leaveplanner.payload.response.EpLeaveDurationAndWorkingHoursResponseDto;
import com.skapp.enterprise.leaveplanner.repository.CalendarEventDao;
import com.skapp.enterprise.leaveplanner.service.EpLeaveCalendarService;
import com.skapp.enterprise.leaveplanner.type.EpGoogleCalendarAutoDeclineMode;
import com.skapp.enterprise.leaveplanner.type.EpMicrosoftCalendarAutoDeclineMode;
import com.skapp.enterprise.leaveplanner.util.Validation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import static com.skapp.community.leaveplanner.util.LeaveModuleUtil.getHolidayAvailabilityOnGivenDateRange;

@Service
@Slf4j
@RequiredArgsConstructor
public class EpLeaveCalendarServiceImpl implements EpLeaveCalendarService {

	private final LeaveRequestDao leaveRequestDao;

	private final TimeConfigDao timeConfigDao;

	private final HolidayDao holidayDao;

	private final EpGoogleCalenderService epGoogleCalenderService;

	private final CalendarEventDao calendarEventDao;

	private final EncryptionDecryptionService encryptionDecryptionService;

	private final MessageUtil messageUtil;

	private final EpGoogleCalenderServiceImpl epGoogleCalenderServiceImpl;

	private final OrganizationService organizationService;

	private final EpMicrosoftCalendarService epMicrosoftCalendarService;

	private final EmployeeCalendarDao employeeCalendarDao;

	@Value("${encryptDecryptAlgorithm.secret}")
	private String encryptSecret;

	@Override
	public ResponseEntityDto getDateRangeAndWorkingHoursForLeave(Long id) {
		log.info("getDateRangeAndWorkingHoursForALeave: execution started");

		LeaveRequest leaveRequest = leaveRequestDao.findById(id).orElse(null);

		if (leaveRequest == null) {
			throw new ModuleException(EpLeaveMessageConstant.EP_LEAVE_CALENDAR_ERROR_LEAVE_REQUEST_NOT_FOUND);
		}

		EpLeaveDurationAndWorkingHoursResponseDto responseDto = getEpLeaveDurationAndWorkingHoursResponseDto(
				leaveRequest);

		log.info("getDateRangeAndWorkingHoursForALeave: execution ended");

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto addOutOfOfficeEventsForLeave(EpOutOfOfficeEventRequestDto epOutOfOfficeEventRequestDto) {
		log.info("addOutOfOfficeEventsForLeave: execution started");

		LeaveRequest leaveRequest = leaveRequestDao.findById(epOutOfOfficeEventRequestDto.getLeaveId()).orElse(null);
		if (leaveRequest == null) {
			throw new ModuleException(EpLeaveMessageConstant.EP_LEAVE_CALENDAR_ERROR_LEAVE_REQUEST_NOT_FOUND);
		}

		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(
				leaveRequest.getEmployee().getUser(), Set.of(EpCalendarType.OUTLOOK, EpCalendarType.GOOGLE));

		if (employeeCalendar == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CALENDAR_CONFIG_NOT_FOUND);
		}

		if (employeeCalendar.getCalendarType() == EpCalendarType.GOOGLE) {
			if (Boolean.FALSE.equals(epGoogleCalenderServiceImpl.getIsGoogleCalenderConnected())) {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CALENDAR_CONFIG_NOT_FOUND);
			}
		}
		else if (employeeCalendar.getCalendarType() == EpCalendarType.OUTLOOK) {
			if (Boolean.FALSE.equals(epMicrosoftCalendarService.getIsMicrosoftCalendarConnected())) {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CALENDAR_CONFIG_NOT_FOUND);
			}
		}
		else {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CALENDAR_CONFIG_NOT_FOUND);
		}

		if (epOutOfOfficeEventRequestDto.getDeclineMessage() != null) {
			Validation.isValidDeclineMessage(epOutOfOfficeEventRequestDto.getDeclineMessage());
		}

		List<Holiday> holidayObjects = holidayDao.findAllByIsActiveTrue();

		if (epOutOfOfficeEventRequestDto.getIsAutoDeclineExistingEventsOnLeaveEnabled() != null
				&& epOutOfOfficeEventRequestDto.getIsAutoDeclineEnabled() != null) {

			addOutOfOfficeOnValidDatesAndTimeWithoutHolidays(leaveRequest, holidayObjects,
					epOutOfOfficeEventRequestDto.getIsAutoDeclineExistingEventsOnLeaveEnabled(),
					epOutOfOfficeEventRequestDto.getIsAutoDeclineEnabled(),
					epOutOfOfficeEventRequestDto.getDeclineMessage(), employeeCalendar.getCalendarType());
		}
		else {
			throw new ModuleException(EpLeaveMessageConstant.EP_LEAVE_CALENDAR_ERROR_AUTO_DECLINE_MODE_NOT_FOUND);
		}

		log.info("addOutOfOfficeEventsForLeave: execution ended");

		return new ResponseEntityDto(false,
				messageUtil.getMessage(EpLeaveMessageConstant.EP_LEAVE_CALENDAR_SUCCESS_CREATED_OUT_OF_OFFICE_EVENTS));
	}

	@Override
	public void deleteOutOfOfficeEventsForLeave(LeaveRequest leaveRequest) {
		log.info("deleteOutOfOfficeEventsForLeave: execution started");

		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(
				leaveRequest.getEmployee().getUser(), Set.of(EpCalendarType.OUTLOOK, EpCalendarType.GOOGLE));

		if (employeeCalendar == null) {
			log.warn("No calendar configuration found for user, skipping calendar event deletion");
			return;
		}

		try {
			List<CalendarEvent> calendarEvents = calendarEventDao.findByLeaveRequest(leaveRequest);

			if (calendarEvents != null && !calendarEvents.isEmpty()) {

				if (employeeCalendar.getCalendarType() == EpCalendarType.GOOGLE) {
					String accessToken = epGoogleCalenderService
						.generateGoogleAccessToken(leaveRequest.getEmployee().getUser());
					for (CalendarEvent calendarEvent : calendarEvents) {
						epGoogleCalenderService.deleteOutOfOfficeEvent(
								encryptionDecryptionService.decrypt(calendarEvent.getEventId(), encryptSecret),
								accessToken);
					}
				}
				else if (employeeCalendar.getCalendarType() == EpCalendarType.OUTLOOK) {
					String accessToken = epMicrosoftCalendarService
						.generateMicrosoftAccessToken(leaveRequest.getEmployee().getUser());
					for (CalendarEvent calendarEvent : calendarEvents) {
						epMicrosoftCalendarService.deleteOutOfOfficeEvent(
								encryptionDecryptionService.decrypt(calendarEvent.getEventId(), encryptSecret),
								accessToken);
					}
				}
				else {
					throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CALENDAR_CONFIG_NOT_FOUND);
				}
			}
		}
		catch (ModuleException e) {
			log.error("Error while deleting out of office events for leave request", e);
		}

		log.info("deleteOutOfOfficeEventsForLeave: execution ended");
	}

	private void addOutOfOfficeOnValidDatesAndTimeWithoutHolidays(LeaveRequest leaveRequest,
			List<Holiday> holidayObjects, Boolean isAutoDeclineExistingEventsOnLeaveEnabled,
			Boolean isAutoDeclineEnabled, String declineMessage, EpCalendarType calendarType) {
		LocalDate startDate = leaveRequest.getStartDate();
		LocalDate endDate = leaveRequest.getEndDate();
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();

		TimeConfig firstTimeConfig = timeConfigs.getFirst();
		EpWorkingHoursDto workStartAndEndTimes = getWorkStartAndEndTimes(leaveRequest, firstTimeConfig);
		long totalHoursAsLong = firstTimeConfig.getTotalHours().longValue();

		String autoDeclineMode;
		if (calendarType == EpCalendarType.GOOGLE) {
			autoDeclineMode = EpGoogleCalendarAutoDeclineMode.DECLINE_NONE.getAutoDeclineMode();
			if (Boolean.TRUE.equals(isAutoDeclineEnabled)) {
				autoDeclineMode = Boolean.TRUE.equals(isAutoDeclineExistingEventsOnLeaveEnabled)
						? EpGoogleCalendarAutoDeclineMode.DECLINE_ALL_CONFLICTING_INVITATION.getAutoDeclineMode()
						: EpGoogleCalendarAutoDeclineMode.DECLINE_ONLY_NEW_CONFLICTING_INVITATIONS.getAutoDeclineMode();
			}
		}
		else {
			autoDeclineMode = EpMicrosoftCalendarAutoDeclineMode.DECLINE_NONE.getAutoDeclineMode();
			if (Boolean.TRUE.equals(isAutoDeclineEnabled)) {
				autoDeclineMode = Boolean.TRUE.equals(isAutoDeclineExistingEventsOnLeaveEnabled)
						? EpMicrosoftCalendarAutoDeclineMode.DECLINE_ALL_CONFLICTING_INVITATION.getAutoDeclineMode()
						: EpMicrosoftCalendarAutoDeclineMode.DECLINE_ONLY_NEW_CONFLICTING_INVITATIONS
							.getAutoDeclineMode();
			}
		}

		String accessToken;
		if (calendarType == EpCalendarType.GOOGLE) {
			accessToken = epGoogleCalenderService.generateGoogleAccessToken(leaveRequest.getEmployee().getUser());
		}
		else {
			accessToken = epMicrosoftCalendarService.generateMicrosoftAccessToken(leaveRequest.getEmployee().getUser());
		}

		if (startDate.equals(endDate)) {
			LocalDateTime startDateTime = startDate.atTime(workStartAndEndTimes.getStartTime());
			long hoursToAdd = totalHoursAsLong;

			if (leaveRequest.getLeaveState().equals(LeaveState.HALFDAY_MORNING)
					|| leaveRequest.getLeaveState().equals(LeaveState.HALFDAY_EVENING)) {
				hoursToAdd /= 2;
			}

			LocalDateTime endDateTime = startDateTime.plusHours(hoursToAdd);

			if (calendarType == EpCalendarType.GOOGLE) {
				saveEvent(leaveRequest, startDateTime, endDateTime, accessToken, autoDeclineMode, declineMessage);
			}
			else {
				saveMicrosoftEvent(leaveRequest, startDateTime, endDateTime, accessToken, autoDeclineMode,
						declineMessage);
			}
			return;
		}

		if (startDate.isAfter(endDate)) {
			LocalDate temp = startDate;
			startDate = endDate;
			endDate = temp;
		}

		LocalDate currentDate = startDate;
		while (!currentDate.isAfter(endDate)) {
			if (CommonModuleUtils.checkIfDayIsWorkingDay(currentDate, timeConfigs,
					organizationService.getOrganizationTimeZone())) {
				HolidayDuration holidayDuration = LeaveModuleUtil.getHolidayAvailabilityOnGivenDate(currentDate,
						holidayObjects);
				LocalDateTime startDateTime = currentDate.atTime(workStartAndEndTimes.getStartTime());
				long hoursToAdd = totalHoursAsLong;

				if (holidayDuration == HolidayDuration.HALF_DAY_MORNING) {
					startDateTime = startDateTime.plusHours(totalHoursAsLong / 2);
					hoursToAdd /= 2;
				}
				else if (holidayDuration == HolidayDuration.HALF_DAY_EVENING) {
					hoursToAdd /= 2;
				}

				LocalDateTime endDateTime = startDateTime.plusHours(hoursToAdd);
				if (calendarType == EpCalendarType.GOOGLE) {
					saveEvent(leaveRequest, startDateTime, endDateTime, accessToken, autoDeclineMode, declineMessage);
				}
				else {
					saveMicrosoftEvent(leaveRequest, startDateTime, endDateTime, accessToken, autoDeclineMode,
							declineMessage);
				}

			}
			currentDate = currentDate.plusDays(1);
		}
	}

	private EpLeaveDurationAndWorkingHoursResponseDto getEpLeaveDurationAndWorkingHoursResponseDto(
			LeaveRequest leaveRequest) {
		EpLeaveDurationAndWorkingHoursResponseDto responseDto = new EpLeaveDurationAndWorkingHoursResponseDto();
		responseDto.setStartDate(leaveRequest.getStartDate());
		responseDto.setEndDate(leaveRequest.getEndDate());
		responseDto.setWorkingHours(getWorkStartAndEndTimes(leaveRequest, timeConfigDao.findAll().getFirst()));
		responseDto.setIsSingleDay(leaveRequest.getStartDate().equals(leaveRequest.getEndDate()));
		responseDto.setIsMultiDayAndIncludeHalfDayLeave(false);

		if (Boolean.FALSE.equals(responseDto.getIsSingleDay())) {
			List<Holiday> holidayObjects = holidayDao.findAllByIsActiveTrue();
			HolidayDuration holidayDuration = getHolidayAvailabilityOnGivenDateRange(leaveRequest.getStartDate(),
					leaveRequest.getEndDate(), holidayObjects);

			if (holidayDuration == HolidayDuration.HALF_DAY_MORNING
					|| holidayDuration == HolidayDuration.HALF_DAY_EVENING) {
				responseDto.setIsMultiDayAndIncludeHalfDayLeave(true);
			}
		}
		return responseDto;
	}

	private EpWorkingHoursDto getWorkStartAndEndTimes(LeaveRequest leaveRequest, TimeConfig timeConfigs) {

		if (timeConfigs == null) {
			throw new ModuleException(EpLeaveMessageConstant.EP_LEAVE_CALENDAR_ERROR_TIME_CONFIG_NOT_FOUND);
		}

		LocalTime startTime = LocalTime.of(timeConfigs.getStartHour(), timeConfigs.getStartMinute());
		long totalHoursAsLong = timeConfigs.getTotalHours().longValue();
		LocalTime endTime = startTime.plusHours(totalHoursAsLong);

		if (leaveRequest.getLeaveState().equals(LeaveState.HALFDAY_MORNING)) {
			endTime = startTime.plusHours(totalHoursAsLong / 2);
		}
		else if (leaveRequest.getLeaveState().equals(LeaveState.HALFDAY_EVENING)) {
			startTime = startTime.plusHours(totalHoursAsLong / 2);
		}

		return new EpWorkingHoursDto(startTime, endTime);
	}

	private void saveEvent(LeaveRequest leaveRequest, LocalDateTime startDateTime, LocalDateTime endDateTime,
			String accessToken, String autoDeclineMode, String declineMessage) {
		CalendarEvent calendarEvent = new CalendarEvent();

		String eventId = encryptionDecryptionService.encrypt(epGoogleCalenderService.createOutOfOfficeEvent(
				startDateTime, endDateTime, accessToken, autoDeclineMode, declineMessage), encryptSecret);

		if (eventId != null) {
			calendarEvent.setEventId(eventId);
		}

		calendarEvent.setLeaveRequest(leaveRequest);

		calendarEventDao.save(calendarEvent);
	}

	private void saveMicrosoftEvent(LeaveRequest leaveRequest, LocalDateTime startDateTime, LocalDateTime endDateTime,
			String accessToken, String autoDeclineMode, String declineMessage) {
		CalendarEvent calendarEvent = new CalendarEvent();

		String eventId = encryptionDecryptionService.encrypt(epMicrosoftCalendarService.createOutOfOfficeEvent(
				startDateTime, endDateTime, accessToken, autoDeclineMode, declineMessage), encryptSecret);

		if (eventId != null) {
			calendarEvent.setEventId(eventId);
		}

		calendarEvent.setLeaveRequest(leaveRequest);

		calendarEventDao.save(calendarEvent);
	}

}
