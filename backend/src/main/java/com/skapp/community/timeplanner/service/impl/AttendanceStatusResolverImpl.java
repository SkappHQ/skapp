package com.skapp.community.timeplanner.service.impl;

import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.payload.request.TimeBlockDto;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import com.skapp.community.timeplanner.service.AttendanceStatusResolver;
import com.skapp.community.timeplanner.type.TimeAttendanceStatus;
import com.skapp.community.timeplanner.type.TimeBlocks;
import com.skapp.community.timeplanner.type.TimeConfigFieldName;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;

import java.time.LocalTime;
import java.time.ZoneId;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnMissingBean(name = "EpAttendanceStatusResolverImpl")
public class AttendanceStatusResolverImpl implements AttendanceStatusResolver {

	private static final int MINUTES_PER_HOUR = 60;

	private static final int MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

	private final TimeConfigDao timeConfigDao;

	private final LeaveRequestDao leaveRequestDao;

	private final OrganizationService organizationService;

	@Override
	@Transactional(readOnly = true)
	public TimeAttendanceStatus resolveTimeStatus(TimeRecord timeRecord) {
		if (timeRecord == null || timeRecord.getClockInTime() == null) {
			return TimeAttendanceStatus.NOT_CLOCKED_IN;
		}

		return isLateArrival(timeRecord) ? TimeAttendanceStatus.LATE_ARRIVAL : TimeAttendanceStatus.ON_TIME;
	}

	private boolean isLateArrival(TimeRecord timeRecord) {
		if (timeRecord.getEmployee() == null) {
			return false;
		}

		TimeConfig timeConfig = timeConfigDao.findByDay(timeRecord.getDay());
		if (timeConfig == null) {
			return false;
		}

		if (timeConfig.getStartHour() == null || timeConfig.getStartMinute() == null) {
			log.warn("isLateArrival: no start time configured for {}, skipping the late check", timeRecord.getDay());
			return false;
		}

		ZoneId orgTimeZone = organizationService.getOrganizationZoneId();
		LocalTime recordStartTime = DateTimeUtils
			.epochMillisToUtcLocalDateTime(timeRecord.getClockInTime(), orgTimeZone)
			.toLocalTime();
		LocalTime lateThreshold = LocalTime.of(timeConfig.getStartHour(), timeConfig.getStartMinute());

		LeaveRequest leaveRequest = leaveRequestDao.findByEmployeeAndDate(timeRecord.getEmployee().getEmployeeId(),
				timeRecord.getDate());
		return isLateArrivalBasedOnLeave(leaveRequest, recordStartTime, timeConfig, lateThreshold);
	}

	private boolean isLateArrivalBasedOnLeave(LeaveRequest leaveRequest, LocalTime recordStartTime,
			TimeConfig timeConfig, LocalTime lateThreshold) {
		if (leaveRequest != null) {
			if (leaveRequest.getLeaveState() == LeaveState.FULLDAY) {
				return false;
			}
			if (leaveRequest.getLeaveState() == LeaveState.HALFDAY_MORNING) {
				return isLateAfterMorningBlock(recordStartTime, timeConfig, lateThreshold);
			}
		}

		return recordStartTime.isAfter(lateThreshold);
	}

	private boolean isLateAfterMorningBlock(LocalTime recordStartTime, TimeConfig timeConfig, LocalTime lateThreshold) {
		TimeBlockDto timeBlockDto = processTimeBlocks(timeConfig.getTimeBlocks(), timeConfig.getTotalHours());
		long morningMinutes = Math.round(toHours(timeBlockDto.getMorningHours()) * MINUTES_PER_HOUR);
		long adjustedMinutes = (long) lateThreshold.toSecondOfDay() / 60 + morningMinutes;

		if (adjustedMinutes >= MINUTES_PER_DAY) {
			return false;
		}

		return recordStartTime.isAfter(LocalTime.MIN.plusMinutes(adjustedMinutes));
	}

	private double toHours(String hours) {
		if (hours == null || hours.isBlank()) {
			return 0d;
		}

		try {
			return Double.parseDouble(hours.trim());
		}
		catch (NumberFormatException e) {
			log.warn("toHours: time block hours '{}' is not numeric, treating as zero", hours);
			return 0d;
		}
	}

	private TimeBlockDto processTimeBlocks(JsonNode timeBlocks, Float totalHours) {
		if (timeBlocks == null || !timeBlocks.isArray() || timeBlocks.isEmpty()) {
			return buildDefaultTimeBlocks(totalHours);
		}

		TimeBlockDto timeBlockDto = new TimeBlockDto();
		for (JsonNode block : timeBlocks) {
			if (!block.hasNonNull(TimeConfigFieldName.TIME_BLOCK.getFieldName())
					|| !block.hasNonNull(TimeConfigFieldName.HOURS.getFieldName())) {
				return buildDefaultTimeBlocks(totalHours);
			}

			String timeBlock = block.get(TimeConfigFieldName.TIME_BLOCK.getFieldName()).asString();
			String hours = block.get(TimeConfigFieldName.HOURS.getFieldName()).asString();

			if (TimeBlocks.MORNING_HOURS.name().equals(timeBlock)) {
				timeBlockDto.setMorningTimeBlock(timeBlock);
				timeBlockDto.setMorningHours(hours);
			}
			else if (TimeBlocks.EVENING_HOURS.name().equals(timeBlock)) {
				timeBlockDto.setEveningTimeBlock(timeBlock);
				timeBlockDto.setEveningHours(hours);
			}
		}

		if (timeBlockDto.getMorningHours() == null) {
			return buildDefaultTimeBlocks(totalHours);
		}

		return timeBlockDto;
	}

	private TimeBlockDto buildDefaultTimeBlocks(Float totalHours) {
		float halfDayHours = (totalHours != null ? totalHours : 0f) / 2;

		TimeBlockDto timeBlockDto = new TimeBlockDto();
		timeBlockDto.setMorningTimeBlock(TimeBlocks.MORNING_HOURS.name());
		timeBlockDto.setMorningHours(String.valueOf(halfDayHours));
		timeBlockDto.setEveningTimeBlock(TimeBlocks.EVENING_HOURS.name());
		timeBlockDto.setEveningHours(String.valueOf(halfDayHours));
		return timeBlockDto;
	}

}
