package com.skapp.community.common.util;

import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import com.skapp.community.timeplanner.model.TimeConfig;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.text.RandomStringGenerator;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Slf4j
@UtilityClass
public class CommonModuleUtils {

	public static final int MAX_USER_CHUNK_SIZE = 100;

	/**
	 * Checks if a given date is a working day based on the time configurations.
	 * @param date The date to check.
	 * @param timeConfigs List of time configurations for working days.
	 * @return True if the date is a working day, false otherwise.
	 */
	public static boolean checkIfDayIsWorkingDay(LocalDate date, List<TimeConfig> timeConfigs,
			String organizationTimeZone) {

		DayOfWeek checkingDay = date.getDayOfWeek();

		if (organizationTimeZone != null) {
			ZoneId orgTimeZone = ZoneId.of(organizationTimeZone);
			ZonedDateTime orgDateTime = date.atStartOfDay(ZoneOffset.UTC).withZoneSameInstant(orgTimeZone);
			checkingDay = orgDateTime.getDayOfWeek();
		}

		if (timeConfigs.isEmpty()) {
			return true;
		}

		for (TimeConfig timeConfig : timeConfigs) {
			if (checkingDay.equals(timeConfig.getDay())) {
				return true;
			}
		}
		return false;
	}

	public static <T> List<List<T>> chunkData(List<T> dataList) {
		List<List<T>> chunkedList = new ArrayList<>();

		if (dataList != null && !dataList.isEmpty()) {
			int arrayLength = (int) Math.ceil((double) dataList.size() / MAX_USER_CHUNK_SIZE);
			for (int index = 0; index < arrayLength; index++) {
				int start = index * MAX_USER_CHUNK_SIZE;
				int end = Math.min(start + MAX_USER_CHUNK_SIZE, dataList.size());
				chunkedList.add(dataList.subList(start, end));
			}
		}

		return chunkedList;
	}

	public static boolean isValidFloat(String floatStr) {
		if (floatStr != null && !floatStr.isBlank()) {
			try {
				Float.parseFloat(floatStr);
			}
			catch (NumberFormatException e) {
				return false;
			}
			return true;
		}
		else {
			return false;
		}
	}

	public static float calculateHoursBetweenEpochMillis(long start, long end) {
		return (float) (end - start) / (1000 * 60 * 60);
	}

	public static DayOfWeek getDayOfWeek(LocalDate date) {
		return date.getDayOfWeek();
	}

	public static int addUpWorkingDaysForAllEmployee(List<Employee> employees, LocalDate startDate, LocalDate endDate,
			List<TimeConfig> timeConfigs, List<LocalDate> holidays, String organizationTimeZone) {
		int totalWorkingDays = 0;
		for (Employee employee : employees) {
			if (employee.getJoinDate() != null && startDate.isBefore(employee.getJoinDate())
					&& employee.getTerminationDate() != null && endDate.isAfter(employee.getTerminationDate())) {
				totalWorkingDays = totalWorkingDays + getWorkingDaysBetweenTwoDates(employee.getJoinDate(),
						employee.getTerminationDate(), timeConfigs, holidays, organizationTimeZone);
			}
			else if (employee.getJoinDate() != null && startDate.isBefore(employee.getJoinDate())
					&& employee.getTerminationDate() == null) {
				totalWorkingDays = totalWorkingDays + getWorkingDaysBetweenTwoDates(employee.getJoinDate(), endDate,
						timeConfigs, holidays, organizationTimeZone);
			}
			else if (employee.getJoinDate() != null && startDate.isAfter(employee.getJoinDate())
					&& employee.getTerminationDate() == null) {
				totalWorkingDays = totalWorkingDays + getWorkingDaysBetweenTwoDates(startDate, endDate, timeConfigs,
						holidays, organizationTimeZone);
			}
			else if (employee.getJoinDate() != null && startDate.isAfter(employee.getJoinDate())
					&& employee.getTerminationDate() != null && endDate.isAfter(employee.getTerminationDate())) {
				totalWorkingDays = totalWorkingDays + getWorkingDaysBetweenTwoDates(startDate,
						employee.getTerminationDate(), timeConfigs, holidays, organizationTimeZone);
			}
			else {
				totalWorkingDays = totalWorkingDays + getWorkingDaysBetweenTwoDates(startDate, endDate, timeConfigs,
						holidays, organizationTimeZone);
			}
		}
		return totalWorkingDays;
	}

	public static int getWorkingDaysBetweenTwoDates(LocalDate startDate, LocalDate endDate,
			List<TimeConfig> timeConfigs, List<LocalDate> holidays, String organizationTimeZone) {
		return getWorkingDaysBetweenTwoDates(startDate, endDate, timeConfigs, holidays, null, null,
				organizationTimeZone);
	}

	public static int getWorkingDaysBetweenTwoDates(LocalDate startDate, LocalDate endDate,
			List<TimeConfig> timeConfigs, List<LocalDate> holidays, List<Holiday> holidayObjects,
			LeaveRequest leaveRequest, String organizationTimeZone) {
		// Ensure the start date is before the end date
		if (startDate.isAfter(endDate)) {
			LocalDate temp = startDate;
			startDate = endDate;
			endDate = temp;
		}

		int workDays = 0;

		LocalDate currentDate = startDate;

		while (!currentDate.isAfter(endDate)) {
			if (checkIfDayIsWorkingDay(currentDate, timeConfigs, organizationTimeZone)
					&& checkIfDayIsNotAHoliday(leaveRequest, holidayObjects, holidays, currentDate)) {
				workDays++;
			}
			currentDate = currentDate.plusDays(1);
		}

		return workDays;
	}

	/**
	 * Checks if the given date is not a holiday based on holiday objects or a list of
	 * holidays.
	 * @param leaveRequest The leave request for context (used for checking half-day
	 * holidays).
	 * @param holidayObjects List of holiday objects, potentially containing half-day and
	 * full-day holidays.
	 * @param holidays List of holidays as LocalDate.
	 * @param date The date to check.
	 * @return True if the date is not a holiday, false otherwise.
	 */
	public static boolean checkIfDayIsNotAHoliday(LeaveRequest leaveRequest, List<Holiday> holidayObjects,
			List<LocalDate> holidays, LocalDate date) {
		boolean isNotHoliday = true;

		if (holidayObjects != null && !holidayObjects.isEmpty()) {
			List<Holiday> halfDays = holidayObjects.stream()

				.filter(holiday -> holiday.getHolidayDuration() == HolidayDuration.HALF_DAY_EVENING
						|| holiday.getHolidayDuration() == HolidayDuration.HALF_DAY_MORNING)
				.toList();

			List<Holiday> fullDays = holidayObjects.stream()
				.filter(holiday -> holiday.getHolidayDuration() == HolidayDuration.FULL_DAY)
				.toList();

			if (fullDays.stream().anyMatch(holiday -> holiday.getDate().equals(date))) {
				return false;
			}
			if (!halfDays.isEmpty()
					&& CommonModuleUtils.checkIfHalfDayLeaveAndHolidayOnSameDay(halfDays, leaveRequest, date)) {
				isNotHoliday = false;
			}
		}
		else if (holidays != null && !holidays.isEmpty() && date != null) {
			return !holidays.contains(date);
		}
		return isNotHoliday;
	}

	public static boolean checkIfHalfDayLeaveAndHolidayOnSameDay(List<Holiday> halfDays, LeaveRequest leaveRequest,
			LocalDate date) {

		return halfDays.stream()
			.filter(holiday -> holiday.getDate().equals(date))

			.anyMatch(
					holiday -> holiday.getHolidayDuration().toString().equals(leaveRequest.getLeaveState().toString()));
	}

	public static boolean validateStartDateAndEndDate(LocalDate startDate, LocalDate endDate) {
		int currentYear = DateTimeUtils.getCurrentYear();
		return startDate.getYear() < currentYear - 1 || endDate.getYear() < currentYear - 1
				|| startDate.isAfter(endDate);
	}

	public static List<Integer> getWorkingDaysIndex(List<TimeConfig> timeConfigs) {
		List<DayOfWeek> workingDays = timeConfigs.stream().map(TimeConfig::getDay).toList();
		List<Integer> workingDaysIndex = new ArrayList<>();
		for (DayOfWeek day : workingDays) {
			workingDaysIndex.add(day.getValue() - 1);
		}
		return workingDaysIndex;
	}

	public static String generateSecureRandomPassword() {
		RandomStringGenerator upperGen = new RandomStringGenerator.Builder().withinRange('A', 'Z').get();
		String upperCaseLetters = upperGen.generate(2);

		RandomStringGenerator lowerGen = new RandomStringGenerator.Builder().withinRange('a', 'z').get();
		String lowerCaseLetters = lowerGen.generate(2);

		RandomStringGenerator numberGen = new RandomStringGenerator.Builder().withinRange('0', '9').get();
		String numbers = numberGen.generate(2);

		RandomStringGenerator specialGen = new RandomStringGenerator.Builder().withinRange('!', '/').get();
		String specialChar = specialGen.generate(2);

		RandomStringGenerator alphaNumGen = new RandomStringGenerator.Builder().withinRange('0', '9')
			.withinRange('a', 'z')
			.withinRange('A', 'Z')
			.get();
		String totalChars = alphaNumGen.generate(2);

		String combinedChars = upperCaseLetters.concat(lowerCaseLetters)
			.concat(numbers)
			.concat(specialChar)
			.concat(totalChars);

		List<Character> pwdChars = combinedChars.chars().mapToObj(c -> (char) c).collect(Collectors.toList());
		Collections.shuffle(pwdChars);

		return pwdChars.stream().collect(StringBuilder::new, StringBuilder::append, StringBuilder::append).toString();
	}

	/**
	 * Safely extracts a value from a potentially nested null structure.
	 * @param <T> The return type
	 * @param supplier A function that might throw NullPointerException
	 * @return The value or null if any part of the chain is null
	 */
	public static <T> T safeGet(Supplier<T> supplier) {
		try {
			return supplier.get();
		}
		catch (NullPointerException e) {
			return null;
		}
	}

	/**
	 * Sets a value on a target object only if the provided value is not null.
	 * @param <T> The type of the value
	 * @param value The value to set
	 * @param setter A function that sets the value on the target object
	 */
	public static <T> void setIfNotNull(T value, Consumer<T> setter) {
		if (value != null) {
			setter.accept(value);
		}
	}

	/**
	 * Safely extracts and sets a value from a nested structure only if not null. Combines
	 * safeGet and setIfNotNull for cleaner syntax.
	 * @param <T> The type of the value
	 * @param valueSupplier A function that navigates the object graph to get the value
	 * @param setter The function to call to set the value
	 */
	public static <T> void setIfExists(Supplier<T> valueSupplier, Consumer<T> setter) {
		T value = safeGet(valueSupplier);
		if (value != null && !(value instanceof JsonNode jsonNode && jsonNode.isEmpty())) {
			setter.accept(value);
		}
	}

	/**
	 * Checks if a collection is null or empty.
	 * @param collection The collection to check
	 * @return true if the collection is null or empty, false otherwise
	 */
	public static boolean isEmpty(Collection<?> collection) {
		return collection == null || collection.isEmpty();
	}

	public static <R, V> void setIfRequestValid(R request, Supplier<V> valueSupplier, Consumer<V> setter) {
		if (request == null || (request instanceof String string && string.trim().isEmpty())) {
			log.warn("setIfRequestValid: Request is null, empty, or blank, skipping operation.");
			return;
		}

		try {
			V value = valueSupplier.get();
			if (value != null) {
				setter.accept(value);
			}
		}
		catch (Exception e) {
			log.error("setIfRequestValid: Error occurred - {}", e.getMessage());
		}
	}

	public static <T> T jsonNodeToValue(JsonNode node, Class<T> valueType, JsonMapper mapper) {
		if (node == null) {
			try {
				return valueType.getDeclaredConstructor().newInstance();
			}
			catch (Exception e) {
				return null;
			}
		}
		return mapper.treeToValue(node, valueType);
	}

}
