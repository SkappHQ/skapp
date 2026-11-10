package com.skapp.community.leaveplanner.util;

import com.skapp.community.leaveplanner.payload.PolicyLeaveDateWindowDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveSpanDto;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DisplayName("PolicyLeaveAnalyticsUtil Unit Tests")
class PolicyLeaveAnalyticsUtilTest {

	private static final double DELTA = 0.0001;

	private static final PolicyLeaveDateWindowDto WINDOW = new PolicyLeaveDateWindowDto(LocalDate.of(2026, 1, 11),
			LocalDate.of(2026, 1, 20));

	private static PolicyLeaveSpanDto span(LocalDate startDate, LocalDate endDate, Float durationDays) {
		return new PolicyLeaveSpanDto(null, startDate, endDate, durationDays, null);
	}

	private static Holiday holiday(LocalDate date, HolidayDuration holidayDuration) {
		Holiday holiday = new Holiday();
		holiday.setDate(date);
		holiday.setHolidayDuration(holidayDuration);
		return holiday;
	}

	@Nested
	@DisplayName("durationWithinWindow")
	class DurationWithinWindow {

		@Test
		@DisplayName("Span crossing the window start - prorates the days inside the window")
		void durationWithinWindow_CrossingStart_ReturnsProratedDays() {
			double result = PolicyLeaveAnalyticsUtil.durationWithinWindow(
					span(LocalDate.of(2026, 1, 6), LocalDate.of(2026, 1, 15), 10f), WINDOW, List.of(), List.of());

			assertEquals(5, result, DELTA);
		}

		@Test
		@DisplayName("Span crossing the window end - prorates the days inside the window")
		void durationWithinWindow_CrossingEnd_ReturnsProratedDays() {
			double result = PolicyLeaveAnalyticsUtil.durationWithinWindow(
					span(LocalDate.of(2026, 1, 19), LocalDate.of(2026, 1, 22), 2f), WINDOW, List.of(), List.of());

			assertEquals(1, result, DELTA);
		}

		@Test
		@DisplayName("Span covering the whole window - returns the window share")
		void durationWithinWindow_CoveringWindow_ReturnsWindowShare() {
			double result = PolicyLeaveAnalyticsUtil.durationWithinWindow(
					span(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 30), 30f), WINDOW, List.of(), List.of());

			assertEquals(10, result, DELTA);
		}

		@Test
		@DisplayName("Span outside the window - returns zero")
		void durationWithinWindow_OutsideWindow_ReturnsZero() {
			double result = PolicyLeaveAnalyticsUtil.durationWithinWindow(
					span(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 5), 5f), WINDOW, List.of(), List.of());

			assertEquals(0, result, DELTA);
		}

		@Test
		@DisplayName("Null duration - returns zero")
		void durationWithinWindow_NullDuration_ReturnsZero() {
			double result = PolicyLeaveAnalyticsUtil.durationWithinWindow(
					span(LocalDate.of(2026, 1, 9), LocalDate.of(2026, 1, 12), null), WINDOW, List.of(), List.of());

			assertEquals(0, result, DELTA);
		}

		@Test
		@DisplayName("Span with no working days - falls back to calendar days")
		void durationWithinWindow_NoWorkingDays_FallsBackToCalendarDays() {
			List<Holiday> holidays = List.of(holiday(LocalDate.of(2026, 1, 9), HolidayDuration.FULL_DAY),
					holiday(LocalDate.of(2026, 1, 10), HolidayDuration.FULL_DAY),
					holiday(LocalDate.of(2026, 1, 11), HolidayDuration.FULL_DAY),
					holiday(LocalDate.of(2026, 1, 12), HolidayDuration.FULL_DAY));

			double result = PolicyLeaveAnalyticsUtil.durationWithinWindow(
					span(LocalDate.of(2026, 1, 9), LocalDate.of(2026, 1, 12), 2f), WINDOW, List.of(), holidays);

			assertEquals(1, result, DELTA);
		}

	}

	@Nested
	@DisplayName("workingDaysInWindow")
	class WorkingDaysInWindow {

		@Test
		@DisplayName("No join or termination date - counts the whole window")
		void workingDaysInWindow_NoDates_ReturnsWholeWindow() {
			double result = PolicyLeaveAnalyticsUtil.workingDaysInWindow(null, null, WINDOW, List.of(), List.of());

			assertEquals(10, result, DELTA);
		}

		@Test
		@DisplayName("Joined after the window ended - returns zero")
		void workingDaysInWindow_JoinedAfterWindow_ReturnsZero() {
			double result = PolicyLeaveAnalyticsUtil.workingDaysInWindow(LocalDate.of(2026, 1, 25), null, WINDOW,
					List.of(), List.of());

			assertEquals(0, result, DELTA);
		}

		@Test
		@DisplayName("Joined mid-window with a future termination date - counts from the join date")
		void workingDaysInWindow_JoinedMidWindowWithFutureTermination_CountsFromJoinDate() {
			double result = PolicyLeaveAnalyticsUtil.workingDaysInWindow(LocalDate.of(2026, 1, 16),
					LocalDate.of(2026, 3, 1), WINDOW, List.of(), List.of());

			assertEquals(5, result, DELTA);
		}

		@Test
		@DisplayName("Terminated mid-window - counts up to the termination date")
		void workingDaysInWindow_TerminatedMidWindow_CountsToTerminationDate() {
			double result = PolicyLeaveAnalyticsUtil.workingDaysInWindow(LocalDate.of(2025, 1, 1),
					LocalDate.of(2026, 1, 13), WINDOW, List.of(), List.of());

			assertEquals(3, result, DELTA);
		}

		@Test
		@DisplayName("Holidays - full day skipped, half day counted as half")
		void workingDaysInWindow_Holidays_AppliesHolidayDurations() {
			List<Holiday> holidays = List.of(holiday(LocalDate.of(2026, 1, 12), HolidayDuration.FULL_DAY),
					holiday(LocalDate.of(2026, 1, 14), HolidayDuration.HALF_DAY_MORNING));

			double result = PolicyLeaveAnalyticsUtil.workingDaysInWindow(null, null, WINDOW, List.of(), holidays);

			assertEquals(8.5, result, DELTA);
		}

	}

}
