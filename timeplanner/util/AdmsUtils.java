package com.skapp.enterprise.timeplanner.util;

import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.time.format.DateTimeFormatter;

@UtilityClass
@Slf4j
public class AdmsUtils {

	public static final DateTimeFormatter PUNCH_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

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

}
