package com.skapp.enterprise.common.util;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for handling UTC date and time operations.
 */
public class EpDateTimeUtils {

	private EpDateTimeUtils() {
		throw new IllegalStateException("Utility class");
	}

	private static final DateTimeFormatter GOOGLE_CALENDAR_DATE_TIME_FORMATTER = DateTimeFormatter
		.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

	/**
	 * Format a LocalDateTime to a UTC date-time string.
	 * @param dateTime LocalDateTime instance.
	 * @return Date-time string in "yyyy-MM-dd'T'HH:mm:ss'Z'" format.
	 * @throws ModuleException If the dateTime is null.
	 */
	public static String formatUtcDateTime(ZonedDateTime dateTime) {
		if (dateTime == null) {
			throw new ModuleException(CommonMessageConstant.ERROR_DATE_TIME_CANNOT_BE_NULL);
		}
		return dateTime.format(GOOGLE_CALENDAR_DATE_TIME_FORMATTER);
	}

}
