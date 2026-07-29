package com.skapp.community.leaveplanner.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.payload.request.AssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.type.EffectiveDateType;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.experimental.UtilityClass;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;

@UtilityClass
public class EmployeeLeavePolicyUtil {

	private static final DateTimeFormatter BULK_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/uuuu")
		.withResolverStyle(ResolverStyle.STRICT);

	public static LocalDate resolveEffectiveFrom(AssignLeavePolicyRequestDto dto, Employee employee) {
		if (dto.getEffectiveDateType() == EffectiveDateType.SPECIFIC) {
			if (dto.getSpecificDate() == null) {
				throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_SPECIFIC_DATE_REQUIRED);
			}
			return dto.getSpecificDate();
		}

		if (employee.getJoinDate() == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_HIRE_DATE_UNAVAILABLE);
		}
		return employee.getJoinDate();
	}

	public static LocalDate parseBulkEffectiveDate(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		try {
			return LocalDate.parse(value.trim(), BULK_DATE_FORMAT);
		}
		catch (DateTimeParseException exception) {
			return null;
		}
	}

	public static String sanitizeCsvCell(String value) {
		if (value == null) {
			return "";
		}
		String sanitized = value.trim();
		while (!sanitized.isEmpty() && "=+-@".indexOf(sanitized.charAt(0)) >= 0) {
			sanitized = sanitized.substring(1).trim();
		}
		return sanitized;
	}

}
