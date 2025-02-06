package com.skapp.enterprise.leaveplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.leaveplanner.util.LeaveModuleUtil;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import com.skapp.enterprise.common.service.EpGoogleCalenderService;
import com.skapp.enterprise.leaveplanner.constant.EpLeaveMessageConstant;
import com.skapp.enterprise.leaveplanner.model.CalendarEvent;
import com.skapp.enterprise.leaveplanner.payload.EpWorkingHoursDto;
import com.skapp.enterprise.leaveplanner.payload.request.EpOutOfOfficeEventRequestDto;
import com.skapp.enterprise.leaveplanner.payload.response.EpLeaveDurationAndWorkingHoursResponseDto;
import com.skapp.enterprise.leaveplanner.repository.CalendarEventDao;
import com.skapp.enterprise.leaveplanner.service.EpLeaveCalendarService;
import com.skapp.enterprise.leaveplanner.util.Validation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static com.skapp.community.leaveplanner.util.LeaveModuleUtil.getHolidayAvailabilityOnGivenDateRange;
import static com.skapp.enterprise.leaveplanner.constant.EpLeaveConstant.DECLINE_ALL_CONFLICTING_INVITATION;
import static com.skapp.enterprise.leaveplanner.constant.EpLeaveConstant.DECLINE_NONE;
import static com.skapp.enterprise.leaveplanner.constant.EpLeaveConstant.DECLINE_ONLY_NEW_CONFLICTING_INVITATIONS;

@Service
@Slf4j
@RequiredArgsConstructor
public class EpLeaveCalendarServiceImpl implements EpLeaveCalendarService {

	private final LeaveRequestDao leaveRequestDao;

	private final TimeConfigDao timeConfigDao;

	private final HolidayDao holidayDao;

	private final EpGoogleCalenderService epGoogleCalenderService;

	private final UserService userService;

	private final CalendarEventDao calendarEventDao;

	private final EncryptionDecryptionService encryptionDecryptionService;

	@Value("${encryptDecryptAlgorithm.secret}")
	private String encryptSecret;

	@Override
	public ResponseEntityDto getDateRangeAndWorkingHoursForALeave(Long id) {
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

		if (epOutOfOfficeEventRequestDto.getDeclineMessage() != null) {
			Validation.isValidDeclineMessage(epOutOfOfficeEventRequestDto.getDeclineMessage());
		}

		List<Holiday> holidayObjects = holidayDao.findAllByIsActiveTrue();

		if (epOutOfOfficeEventRequestDto.getIsAutoDeclineExistingEventsOnLeaveEnabled() != null
				&& epOutOfOfficeEventRequestDto.getIsAutoDeclineEnabled() != null) {
			addOutOfOfficeOnValidDatesAndTimeWithoutHolidays(leaveRequest, holidayObjects,
					epOutOfOfficeEventRequestDto.getIsAutoDeclineExistingEventsOnLeaveEnabled(),
					epOutOfOfficeEventRequestDto.getIsAutoDeclineEnabled(),
					epOutOfOfficeEventRequestDto.getDeclineMessage());
		}
		else {
			throw new ModuleException(EpLeaveMessageConstant.EP_LEAVE_CALENDAR_ERROR_AUTO_DECLINE_MODE_NOT_FOUND);
		}

		log.info("addOutOfOfficeEventsForLeave: execution ended");

		return new ResponseEntityDto(false, "Creating out of office event success");
	}

	@Override
	public void deleteOutOfOfficeEventsForLeave(LeaveRequest leaveRequest) {
		log.info("deleteOutOfOfficeEventsForLeave: execution started");

		List<CalendarEvent> calendarEvents = calendarEventDao.findByLeaveRequest(leaveRequest);

		if (calendarEvents != null && !calendarEvents.isEmpty()) {
			String accessToken = epGoogleCalenderService.generateAccessToken(leaveRequest.getEmployee().getUser());
			for (CalendarEvent calendarEvent : calendarEvents) {
				epGoogleCalenderService.deleteOutOfOfficeEvent(
						encryptionDecryptionService.decrypt(calendarEvent.getEventId(), encryptSecret), accessToken);
			}
		}

		log.info("deleteOutOfOfficeEventsForLeave: execution ended");
	}

	private void addOutOfOfficeOnValidDatesAndTimeWithoutHolidays(LeaveRequest leaveRequest,
			List<Holiday> holidayObjects, Boolean isAutoDeclineExistingEventsOnLeaveEnabled,
			Boolean isAutoDeclineEnabled, String declineMessage) {
		LocalDate startDate = leaveRequest.getStartDate();
		LocalDate endDate = leaveRequest.getEndDate();
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();

		TimeConfig firstTimeConfig = timeConfigs.getFirst();
		EpWorkingHoursDto workStartAndEndTimes = getWorkStartAndEndTimes(leaveRequest, firstTimeConfig);
		long totalHoursAsLong = firstTimeConfig.getTotalHours().longValue();

		String autoDeclineMode = DECLINE_NONE;

		if (Boolean.TRUE.equals(isAutoDeclineEnabled)) {
			autoDeclineMode = Boolean.TRUE.equals(isAutoDeclineExistingEventsOnLeaveEnabled)
					? DECLINE_ALL_CONFLICTING_INVITATION : DECLINE_ONLY_NEW_CONFLICTING_INVITATIONS;
		}

		String accessToken = epGoogleCalenderService.generateAccessToken(userService.getCurrentUser());

		if (startDate.equals(endDate)) {
			LocalDateTime startDateTime = startDate.atTime(workStartAndEndTimes.getStartTime());
			long hoursToAdd = totalHoursAsLong;

			if (leaveRequest.getLeaveState().equals(LeaveState.HALFDAY_MORNING)
					|| leaveRequest.getLeaveState().equals(LeaveState.HALFDAY_EVENING)) {
				hoursToAdd /= 2;
			}

			LocalDateTime endDateTime = startDateTime.plusHours(hoursToAdd);

			saveEvent(leaveRequest, startDateTime, endDateTime, accessToken, autoDeclineMode, declineMessage);

			return;
		}

		if (startDate.isAfter(endDate)) {
			LocalDate temp = startDate;
			startDate = endDate;
			endDate = temp;
		}

		LocalDate currentDate = startDate;
		while (!currentDate.isAfter(endDate)) {
			if (CommonModuleUtils.checkIfDayIsWorkingDay(currentDate, timeConfigs)) {
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
				saveEvent(leaveRequest, startDateTime, endDateTime, accessToken, autoDeclineMode, declineMessage);

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

}
