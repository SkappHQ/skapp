package com.skapp.community.timeplanner.service.impl;

import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.timeplanner.service.AttendanceStatusResolver;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.payload.request.TimeBlockDto;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import com.skapp.community.timeplanner.type.TimeAttendanceStatus;
import com.skapp.community.timeplanner.type.TimeBlocks;
import com.skapp.community.timeplanner.type.TimeConfigFieldName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

@Service
@RequiredArgsConstructor
public class AttendanceStatusResolverImpl implements AttendanceStatusResolver {

	private final TimeConfigDao timeConfigDao;

	private final LeaveRequestDao leaveRequestDao;

	private final OrganizationService organizationService;

	@Override
	public TimeAttendanceStatus resolveTimeStatus(TimeRecord timeRecord) {
		if (timeRecord == null || timeRecord.getClockInTime() == null) {
			return TimeAttendanceStatus.NOT_CLOCKED_IN;
		}

		return isLateArrival(timeRecord) ? TimeAttendanceStatus.LATE_ARRIVAL : TimeAttendanceStatus.ON_TIME;
	}

	private boolean isLateArrival(TimeRecord timeRecord) {
		if (timeRecord.getEmployee() == null)
			return false;

		if (timeRecord.getClockInTime() == null)
			return false;

		TimeConfig timeConfig = timeConfigDao.findByDay(timeRecord.getDay());
		if (timeConfig == null)
			return false;

		ZoneId orgTimeZone = ZoneId.of(organizationService.getOrganizationTimeZone());
		LocalTime utcTime = DateTimeUtils.epochMillisToUtcLocalTime(timeRecord.getClockInTime());

		ZonedDateTime orgDateTime = ZonedDateTime.of(timeRecord.getDate(), utcTime, ZoneOffset.UTC)
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
				TimeBlockDto timeBlockDto = processTimeBlocks(timeConfig.getTimeBlocks(), timeConfig.getTotalHours());
				LocalTime adjustedLateThreshold = lateThreshold
					.plusHours((long) Double.parseDouble(timeBlockDto.getMorningHours()));
				return recordStartTime.isAfter(adjustedLateThreshold);
			}
		}
		return recordStartTime.isAfter(lateThreshold);
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
