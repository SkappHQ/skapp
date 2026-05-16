package com.skapp.community.leaveplanner.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import com.skapp.community.timeplanner.model.TimeConfig;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@UtilityClass
public class LeaveModuleUtil {

	public static int getLeaveCycleEndYear(int cycleStartMonth, int cycleStartDay) {
		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();
		int currentYear = currentDate.getYear();
		int currentMonth = currentDate.getMonthValue();

		int cycleEndYear;

		if (cycleStartMonth == 1) { // January
			if (cycleStartDay == 1) {
				cycleEndYear = currentYear;
			}
			else {
				cycleEndYear = currentYear + 1;
			}
		}
		else {
			if (currentMonth < cycleStartMonth) {
				cycleEndYear = currentYear;
			}
			else {
				cycleEndYear = currentYear + 1;
			}
		}

		return cycleEndYear;
	}

	public static ObjectNode getLeaveCycleConfigs(String leaveCycleData) {
		ObjectMapper mapper = new ObjectMapper();
		try {
			return (ObjectNode) mapper.readTree(leaveCycleData);
		}
		catch (Exception e) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_PARSING_LEAVE_CYCLE_DATA,
					new String[] { e.getMessage() });
		}
	}

	public static LocalDate getDateFromTheGivenBusinessDayCount(LocalDate localDate, int businessDayCount,
			List<Integer> workingDaysIndex, List<LocalDate> holidayDates) {
		LocalDate currentDate = localDate; // from day before given date
		int count = 1; // including current day

		while (count < businessDayCount) {
			currentDate = currentDate.minusDays(1);

			// Check if the current date is a working day
			if ((workingDaysIndex.isEmpty() || workingDaysIndex.contains(currentDate.getDayOfWeek().getValue() - 1))
					&& !holidayDates.contains(currentDate)) {
				count++;
			}
		}
		return currentDate;
	}

	public static int getNumberOfMonthsBetweenTwoDates(LocalDate startDate, LocalDate endDate) {
		return (int) ChronoUnit.MONTHS.between(startDate, endDate) + 1;
	}

	public static HolidayDuration getHolidayAvailabilityOnGivenDate(LocalDate date, List<Holiday> holidayObjects) {
		return holidayObjects.stream()
			.filter(holiday -> holiday.getDate().equals(date))
			.map(Holiday::getHolidayDuration)
			.findFirst()
			.orElse(null);
	}

	public static HolidayDuration getHolidayAvailabilityOnGivenDateRange(LocalDate startDate, LocalDate endDate,
			List<Holiday> holidayObjects) {
		if (startDate.isAfter(endDate)) {
			LocalDate temp = startDate;
			startDate = endDate;
			endDate = temp;
		}

		for (LocalDate currentDate = startDate; !currentDate.isAfter(endDate); currentDate = currentDate.plusDays(1)) {
			LocalDate finalCurrentDate = currentDate;
			HolidayDuration holidayDuration = holidayObjects.stream()
				.filter(holiday -> holiday.getDate().equals(finalCurrentDate))
				.map(Holiday::getHolidayDuration)
				.findFirst()
				.orElse(null);

			if (holidayDuration == HolidayDuration.HALF_DAY_MORNING
					|| holidayDuration == HolidayDuration.HALF_DAY_EVENING) {
				return holidayDuration;
			}
		}

		LocalDate finalStartDate = startDate;
		LocalDate finalEndDate = endDate;
		boolean allFullDays = holidayObjects.stream()
			.filter(holiday -> !holiday.getDate().isBefore(finalStartDate) && !holiday.getDate().isAfter(finalEndDate))
			.allMatch(holiday -> holiday.getHolidayDuration() == HolidayDuration.FULL_DAY);

		return allFullDays ? HolidayDuration.FULL_DAY : null;
	}

	public static float getWorkingDaysBetweenTwoDates(LocalDate startDate, LocalDate endDate,
			List<TimeConfig> timeConfigs, List<Holiday> holidayObjects, String organizationTimeZone) {
		if (startDate.isAfter(endDate)) {
			LocalDate temp = startDate;
			startDate = endDate;
			endDate = temp;
		}
		float workDays = 0;
		LocalDate currentDate = startDate;
		while (!currentDate.isAfter(endDate)) {
			if (CommonModuleUtils.checkIfDayIsWorkingDay(currentDate, timeConfigs, organizationTimeZone)) {
				HolidayDuration holidayDuration = LeaveModuleUtil.getHolidayAvailabilityOnGivenDate(currentDate,
						holidayObjects);
				if (holidayDuration == null) {
					workDays++;
				}
				else if (holidayDuration == HolidayDuration.HALF_DAY_MORNING
						|| holidayDuration == HolidayDuration.HALF_DAY_EVENING) {
					workDays += 0.5F;
				}
			}
			currentDate = currentDate.plusDays(1);
		}
		return workDays;
	}

	public static void validateTeamsForLeaveAnalytics(List<Long> teamIds, User currentUser, List<Team> teams) {
		if (teamIds == null || (teamIds.size() == 1 && teamIds.contains(-1L))) {
			return;
		}
		boolean isSuperAdminOrAttendanceAdmin = isUserSuperAdminOrLeaveAdmin(currentUser);

		PeopleUtil.validateTeamsExist(teamIds, teams);
		if (!isSuperAdminOrAttendanceAdmin) {
			PeopleUtil.validateUserIsSupervisor(teams, currentUser);
		}
	}

	public static boolean isUserSuperAdminOrLeaveAdmin(User user) {
		EmployeeRole role = user.getEmployee().getEmployeeRole();
		return role.getIsSuperAdmin() || Role.LEAVE_ADMIN.equals(role.getLeaveRole());
	}

}
