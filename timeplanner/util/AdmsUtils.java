package com.skapp.enterprise.timeplanner.util;

import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@UtilityClass
@Slf4j
public class AdmsUtils {

	public static final DateTimeFormatter PUNCH_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	// Device configuration defaults sent in OPTIONS response
	public static final String DEFAULT_ERROR_DELAY = "ErrorDelay=60";

	public static final String DEFAULT_DELAY = "Delay=30";

	public static final String DEFAULT_TRANS_TIMES = "TransTimes=00:00;14:05";

	public static final String DEFAULT_TRANS_INTERVAL = "TransInterval=1";

	public static final String DEFAULT_TRANS_FLAG = "TransFlag=TransData AttLog OpLog";

	public static final String DEFAULT_REALTIME = "Realtime=1";

	public static final String DEFAULT_ENCRYPT = "Encrypt=0";

	// ATTLOG format: pin \t datetime \t status \t verifyType [\t workCode]
	// First 4 fields are required for a valid attendance record; workCode is optional.
	private static final int MIN_ATTLOG_FIELDS = 4;

	public static boolean isValidAttLogLine(String line) {
		String[] fields = line.split("\\t");
		if (fields.length < MIN_ATTLOG_FIELDS) {
			log.warn("Invalid ATTLOG line (insufficient fields): {}", line);
			return false;
		}
		return true;
	}

	public static Integer parseInteger(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		try {
			return Integer.parseInt(value);
		}
		catch (NumberFormatException e) {
			return null;
		}
	}

	public static Long parseLong(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		try {
			return Long.parseLong(value);
		}
		catch (NumberFormatException e) {
			log.warn("Failed to parse long '{}'", value);
			return null;
		}
	}

	public static LocalDateTime parseDateTime(String value, DateTimeFormatter formatter) {
		try {
			return LocalDateTime.parse(value, formatter);
		}
		catch (DateTimeParseException e) {
			log.warn("Failed to parse datetime '{}', returning null", value);
			return null;
		}
	}

}
