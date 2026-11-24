package com.skapp.community.leaveplanner.util;

import com.skapp.community.leaveplanner.repository.projection.LeaveRequestPeriod;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import com.skapp.community.timeplanner.model.TimeConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@DisplayName("LeaveModuleUtil Unit Tests")
class LeaveModuleUtilTest {

	private static final LocalDate MONDAY = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY));

	private static final LocalDate SATURDAY = MONDAY.plusDays(5);

	private static final List<TimeConfig> WEEKDAYS = List.of(timeConfig(DayOfWeek.MONDAY),
			timeConfig(DayOfWeek.TUESDAY), timeConfig(DayOfWeek.WEDNESDAY), timeConfig(DayOfWeek.THURSDAY),
			timeConfig(DayOfWeek.FRIDAY));

	private static TimeConfig timeConfig(DayOfWeek day) {
		TimeConfig timeConfig = new TimeConfig();
		timeConfig.setDay(day);
		return timeConfig;
	}

	private static Holiday holiday(LocalDate date, HolidayDuration holidayDuration) {
		Holiday holiday = new Holiday();
		holiday.setDate(date);
		holiday.setHolidayDuration(holidayDuration);
		return holiday;
	}

	@Nested
	@DisplayName("getLeaveDaysOnDate")
	class GetLeaveDaysOnDate {

		@Test
		@DisplayName("Non-working day - returns 0")
		void getLeaveDaysOnDate_NonWorkingDay_ReturnsZero() {
			assertEquals(0f, LeaveModuleUtil.getLeaveDaysOnDate(SATURDAY, LeaveState.FULLDAY, WEEKDAYS, null));
		}

		@Test
		@DisplayName("Full-day holiday - returns 0")
		void getLeaveDaysOnDate_FullDayHoliday_ReturnsZero() {
			assertEquals(0f,
					LeaveModuleUtil.getLeaveDaysOnDate(MONDAY, LeaveState.FULLDAY, WEEKDAYS, HolidayDuration.FULL_DAY));
		}

		@Test
		@DisplayName("Full-day leave on a half-day holiday - returns 0.5")
		void getLeaveDaysOnDate_FullDayLeaveOnHalfDayHoliday_ReturnsHalf() {
			assertEquals(0.5f, LeaveModuleUtil.getLeaveDaysOnDate(MONDAY, LeaveState.FULLDAY, WEEKDAYS,
					HolidayDuration.HALF_DAY_MORNING));
		}

		@Test
		@DisplayName("Half-day leave on the same half as a half-day holiday - returns 0")
		void getLeaveDaysOnDate_HalfDayLeaveOnSameHalfHoliday_ReturnsZero() {
			assertEquals(0f, LeaveModuleUtil.getLeaveDaysOnDate(MONDAY, LeaveState.HALFDAY_MORNING, WEEKDAYS,
					HolidayDuration.HALF_DAY_MORNING));
		}

		@Test
		@DisplayName("Half-day leave on a normal day - returns 0.5")
		void getLeaveDaysOnDate_HalfDayLeave_ReturnsHalf() {
			assertEquals(0.5f, LeaveModuleUtil.getLeaveDaysOnDate(MONDAY, LeaveState.HALFDAY_MORNING, WEEKDAYS, null));
		}

		@Test
		@DisplayName("Full-day leave on a normal day - returns 1")
		void getLeaveDaysOnDate_FullDayLeave_ReturnsOne() {
			assertEquals(1f, LeaveModuleUtil.getLeaveDaysOnDate(MONDAY, LeaveState.FULLDAY, WEEKDAYS, null));
		}

	}

	@Nested
	@DisplayName("getHolidayDurationsByDate")
	class GetHolidayDurationsByDate {

		@Test
		@DisplayName("Morning and evening holidays on the same date - resolves to full day")
		void getHolidayDurationsByDate_DifferentHalvesOnSameDate_ReturnsFullDay() {
			Map<LocalDate, HolidayDuration> result = LeaveModuleUtil
				.getHolidayDurationsByDate(List.of(holiday(MONDAY, HolidayDuration.HALF_DAY_MORNING),
						holiday(MONDAY, HolidayDuration.HALF_DAY_EVENING)), MONDAY, MONDAY);
			assertEquals(HolidayDuration.FULL_DAY, result.get(MONDAY));
		}

	}

	@Nested
	@DisplayName("getLeaveDaysByTypeAndMonth")
	class GetLeaveDaysByTypeAndMonth {

		@Test
		@DisplayName("Leave crossing a month boundary - splits the days by month")
		void getLeaveDaysByTypeAndMonth_CrossesMonthBoundary_SplitsByMonth() {
			LocalDate monthEnd = MONDAY.with(TemporalAdjusters.lastDayOfMonth());
			LocalDate nextMonthStart = monthEnd.plusDays(1);
			LeaveRequestPeriod leavePeriod = new LeaveRequestPeriod(1L, monthEnd, nextMonthStart, LeaveState.FULLDAY);

			Map<Integer, Map<Integer, Double>> result = LeaveModuleUtil.getLeaveDaysByTypeAndMonth(List.of(leavePeriod),
					monthEnd, nextMonthStart, List.of(), List.of());

			assertEquals(1.0, result.get(1).get(monthEnd.getMonthValue()));
			assertEquals(1.0, result.get(1).get(nextMonthStart.getMonthValue()));
		}

		@Test
		@DisplayName("Leave outside the cycle range - only counts the days inside it")
		void getLeaveDaysByTypeAndMonth_OutsideCycleRange_IsClipped() {
			LocalDate cycleStart = MONDAY.with(TemporalAdjusters.firstDayOfMonth());
			LocalDate cycleEnd = cycleStart.plusDays(1);
			LeaveRequestPeriod leavePeriod = new LeaveRequestPeriod(1L, cycleStart.minusDays(2), cycleEnd,
					LeaveState.FULLDAY);

			Map<Integer, Map<Integer, Double>> result = LeaveModuleUtil.getLeaveDaysByTypeAndMonth(List.of(leavePeriod),
					cycleStart, cycleEnd, List.of(), List.of());

			assertEquals(2.0, result.get(1).get(cycleStart.getMonthValue()));
			assertFalse(result.get(1).containsKey(cycleStart.minusDays(2).getMonthValue()));
		}

	}

}
