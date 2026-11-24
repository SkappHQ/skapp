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
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("LeaveModuleUtil Unit Tests")
class LeaveModuleUtilTest {

	private static final LocalDate MONDAY = LocalDate.of(2026, 11, 2);

	private static final LocalDate SATURDAY = LocalDate.of(2026, 11, 7);

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
		@DisplayName("Half-day leave on the other half of a half-day holiday - returns 0.5")
		void getLeaveDaysOnDate_HalfDayLeaveOnOtherHalfHoliday_ReturnsHalf() {
			assertEquals(0.5f, LeaveModuleUtil.getLeaveDaysOnDate(MONDAY, LeaveState.HALFDAY_EVENING, WEEKDAYS,
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

		@Test
		@DisplayName("Null leave state - counts as a full day")
		void getLeaveDaysOnDate_NullLeaveState_ReturnsOne() {
			assertEquals(1f, LeaveModuleUtil.getLeaveDaysOnDate(MONDAY, null, WEEKDAYS, null));
		}

		@Test
		@DisplayName("No time configs - every day is a working day")
		void getLeaveDaysOnDate_EmptyTimeConfigs_CountsWeekend() {
			assertEquals(1f, LeaveModuleUtil.getLeaveDaysOnDate(SATURDAY, LeaveState.FULLDAY, List.of(), null));
		}

	}

	@Nested
	@DisplayName("getHolidayDurationsByDate")
	class GetHolidayDurationsByDate {

		@Test
		@DisplayName("Full-day and half-day holiday on the same date - resolves to full day")
		void getHolidayDurationsByDate_FullAndHalfOnSameDate_ReturnsFullDay() {
			Map<LocalDate, HolidayDuration> result = LeaveModuleUtil.getHolidayDurationsByDate(List
				.of(holiday(MONDAY, HolidayDuration.HALF_DAY_MORNING), holiday(MONDAY, HolidayDuration.FULL_DAY)),
					MONDAY, MONDAY);
			assertEquals(HolidayDuration.FULL_DAY, result.get(MONDAY));
		}

		@Test
		@DisplayName("Morning and evening holidays on the same date - resolves to full day")
		void getHolidayDurationsByDate_DifferentHalvesOnSameDate_ReturnsFullDay() {
			Map<LocalDate, HolidayDuration> result = LeaveModuleUtil
				.getHolidayDurationsByDate(List.of(holiday(MONDAY, HolidayDuration.HALF_DAY_MORNING),
						holiday(MONDAY, HolidayDuration.HALF_DAY_EVENING)), MONDAY, MONDAY);
			assertEquals(HolidayDuration.FULL_DAY, result.get(MONDAY));
		}

		@Test
		@DisplayName("Two holidays on the same half - keeps the half")
		void getHolidayDurationsByDate_SameHalfOnSameDate_ReturnsHalf() {
			Map<LocalDate, HolidayDuration> result = LeaveModuleUtil
				.getHolidayDurationsByDate(List.of(holiday(MONDAY, HolidayDuration.HALF_DAY_MORNING),
						holiday(MONDAY, HolidayDuration.HALF_DAY_MORNING)), MONDAY, MONDAY);
			assertEquals(HolidayDuration.HALF_DAY_MORNING, result.get(MONDAY));
		}

		@Test
		@DisplayName("Holiday outside the range - is left out")
		void getHolidayDurationsByDate_OutsideRange_IsExcluded() {
			Map<LocalDate, HolidayDuration> result = LeaveModuleUtil.getHolidayDurationsByDate(
					List.of(holiday(MONDAY.minusDays(1), HolidayDuration.FULL_DAY)), MONDAY, MONDAY.plusDays(4));
			assertTrue(result.isEmpty());
		}

	}

	@Nested
	@DisplayName("getLeaveDaysByTypeAndMonth")
	class GetLeaveDaysByTypeAndMonth {

		@Test
		@DisplayName("Leave crossing a month boundary - splits the days by month")
		void getLeaveDaysByTypeAndMonth_CrossesMonthBoundary_SplitsByMonth() {
			LeaveRequestPeriod leavePeriod = new LeaveRequestPeriod(1L, LocalDate.of(2026, 10, 29),
					LocalDate.of(2026, 11, 3), LeaveState.FULLDAY);

			Map<Integer, Map<Integer, Double>> result = LeaveModuleUtil.getLeaveDaysByTypeAndMonth(List.of(leavePeriod),
					LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31), WEEKDAYS, List.of());

			assertEquals(2.0, result.get(1).get(10));
			assertEquals(2.0, result.get(1).get(11));
		}

		@Test
		@DisplayName("Leave outside the cycle range - only counts the days inside it")
		void getLeaveDaysByTypeAndMonth_OutsideCycleRange_IsClipped() {
			LeaveRequestPeriod leavePeriod = new LeaveRequestPeriod(1L, LocalDate.of(2025, 12, 29),
					LocalDate.of(2026, 1, 2), LeaveState.FULLDAY);

			Map<Integer, Map<Integer, Double>> result = LeaveModuleUtil.getLeaveDaysByTypeAndMonth(List.of(leavePeriod),
					LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31), WEEKDAYS, List.of());

			assertEquals(2.0, result.get(1).get(1));
			assertFalse(result.get(1).containsKey(12));
		}

		@Test
		@DisplayName("Holidays and weekends - are not counted")
		void getLeaveDaysByTypeAndMonth_WithHolidaysAndWeekend_SkipsThem() {
			LeaveRequestPeriod leavePeriod = new LeaveRequestPeriod(2L, MONDAY, MONDAY.plusDays(6), LeaveState.FULLDAY);
			List<Holiday> holidays = List.of(holiday(MONDAY, HolidayDuration.FULL_DAY),
					holiday(MONDAY.plusDays(1), HolidayDuration.HALF_DAY_EVENING));

			Map<Integer, Map<Integer, Double>> result = LeaveModuleUtil.getLeaveDaysByTypeAndMonth(List.of(leavePeriod),
					MONDAY, MONDAY.plusDays(6), WEEKDAYS, holidays);

			assertEquals(3.5, result.get(2).get(11));
			assertNull(result.get(1));
		}

	}

}
