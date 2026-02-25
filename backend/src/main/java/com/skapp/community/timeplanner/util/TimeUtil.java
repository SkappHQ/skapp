package com.skapp.community.timeplanner.util;

import com.skapp.community.timeplanner.model.TimeConfig;
import tools.jackson.databind.JsonNode;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TimeUtil {

	private TimeUtil() {
		throw new IllegalStateException("Illegal instantiate");
	}

	public static boolean isTeamSupervisorCountValid(List<Long> supervisorIds) {
		return supervisorIds.size() > 3;
	}

	public static Map<String, Float> extractHours(TimeConfig currentDayConfig) {
		Map<String, Float> hoursMap = new HashMap<>();
		hoursMap.put("MORNING_HOURS", 0.0f);
		hoursMap.put("EVENING_HOURS", 0.0f);

		JsonNode timeBlocksNode = currentDayConfig.getTimeBlocks();
		for (JsonNode block : timeBlocksNode) {
			String timeBlock = block.get("timeBlock").asString();
			float hours = block.get("hours").asFloat();

			hoursMap.computeIfPresent(timeBlock, (key, oldValue) -> hours);
		}
		return hoursMap;
	}

	public static boolean isCurrentTimeInEvening(TimeConfig currentDayConfig, float morningHours, float eveningHours) {
		LocalTime startTime = LocalTime.of(currentDayConfig.getStartHour(), currentDayConfig.getStartMinute());
		LocalTime morningEndTime = startTime.plusHours((long) morningHours);
		LocalTime eveningEndTime = morningEndTime.plusHours((long) eveningHours);
		LocalTime currentTime = LocalTime.now();
		return currentTime.isAfter(morningEndTime) && currentTime.isBefore(eveningEndTime);
	}

	public static boolean isCurrentTimeInMorning(TimeConfig currentDayConfig, float morningHours) {
		LocalTime startTime = LocalTime.of(currentDayConfig.getStartHour(), currentDayConfig.getStartMinute());
		LocalTime endTime = startTime.plusHours((long) morningHours);
		LocalTime currentTime = LocalTime.now();
		return currentTime.isAfter(startTime) && currentTime.isBefore(endTime);
	}

	public static String formatHoursAndMinutes(double hours) {
		int wholeHours = (int) hours;
		int minutes = (int) ((hours - wholeHours) * 60);
		return String.format("%dh %dm", wholeHours, minutes);
	}

	/**
	 * Checks if a given date is within a specified date range.
	 * @param startDate the start date of the range.
	 * @param endDate the end date of the range.
	 * @param currentDate the date to check.
	 * @return true if the currentDate falls within or on the start/end dates; false
	 * otherwise.
	 */
	public static boolean isDateWithinRange(LocalDate startDate, LocalDate endDate, LocalDate currentDate) {
		return (currentDate.isEqual(startDate) || currentDate.isAfter(startDate))
				&& (currentDate.isEqual(endDate) || currentDate.isBefore(endDate));
	}

}
