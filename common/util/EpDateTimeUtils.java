package com.skapp.enterprise.common.util;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import lombok.experimental.UtilityClass;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for handling UTC date and time operations.
 */
@UtilityClass
public class EpDateTimeUtils {

	private static final DateTimeFormatter GOOGLE_CALENDAR_DATE_TIME_FORMATTER = DateTimeFormatter
		.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

	public static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
		.withZone(ZoneId.of("Asia/Colombo"));

	/**
	 * Format a LocalDateTime to a UTC date-time string.
	 * @param dateTime LocalDateTime instance.
	 * @return Date-time string in "yyyy-MM-dd'T'HH:mm:ss'Z'" format.
	 * @throws ModuleException If the dateTime is null.
	 */
	public static String formatUtcDateTime(ZonedDateTime dateTime) {
		if (dateTime == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_DATE_TIME_CANNOT_BE_NULL);
		}
		return dateTime.format(GOOGLE_CALENDAR_DATE_TIME_FORMATTER);
	}

	public static boolean isBeforeStartOfCurrentWeek(LocalDateTime lastSeenAt, ZoneId orgZone) {
		LocalDate startOfWeek = LocalDate.now(orgZone).with(DayOfWeek.MONDAY);
		LocalDate lastSeenDate = lastSeenAt.atZone(ZoneOffset.UTC).withZoneSameInstant(orgZone).toLocalDate();
		return lastSeenDate.isBefore(startOfWeek);
	}

	public static boolean isBeforeCustomDays(LocalDateTime lastSeenAt, Integer customDays, ZoneId orgZone) {
		if (customDays == null || customDays < 1) {
			return true;
		}
		LocalDate threshold = LocalDate.now(orgZone).minusDays(customDays);
		LocalDate lastSeenDate = lastSeenAt.atZone(ZoneOffset.UTC).withZoneSameInstant(orgZone).toLocalDate();
		return lastSeenDate.isBefore(threshold) || lastSeenDate.isEqual(threshold);
	}

}
