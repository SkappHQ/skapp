package com.skapp.enterprise.common.util;

import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@UtilityClass
@Slf4j
public class ParseUtils {

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
