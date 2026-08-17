package com.skapp.community.leaveplanner.util;

import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.payload.PolicyLeaveDateWindowDto;
import com.skapp.community.leaveplanner.type.AccrualFrequency;
import com.skapp.community.leaveplanner.type.AccrualTiming;
import com.skapp.community.leaveplanner.type.FirstAccrualType;
import com.skapp.community.leaveplanner.type.PolicyType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.MonthDay;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("PolicyLeaveAccrualUtil Carryover Unit Tests")
class PolicyLeaveAccrualUtilCarryoverTest {

	private static final MonthDay CALENDAR_YEAR = MonthDay.of(1, 1);

	private static final MonthDay APRIL_CYCLE = MonthDay.of(4, 1);

	/**
	 * A yearly policy crediting 12 days at the end of the cycle, so a full prior cycle
	 * always allocates 12 days.
	 */
	private LeavePolicy yearlyPolicy(Boolean carryoverEnabled, String carryoverExpiryDate, Float maxCarryoverDays) {
		LeavePolicy policy = new LeavePolicy();
		policy.setId(1L);
		policy.setName("Annual");
		policy.setPolicyType(PolicyType.ACCRUAL);
		policy.setAccrualDays(12f);
		policy.setFrequency(AccrualFrequency.YEARLY);
		policy.setFirstAccrual(FirstAccrualType.FULL);
		policy.setAccrualTiming(AccrualTiming.PERIOD_END);
		policy.setIsCarryoverEnabled(carryoverEnabled);
		policy.setCarryoverExpiryDate(carryoverExpiryDate);
		policy.setMaxCarryoverDays(maxCarryoverDays);
		return policy;
	}

	private PolicyLeaveUsageLookup noUsage() {
		return (from, to) -> 0f;
	}

	/**
	 * Usage that all falls on a single date, so window filtering can be asserted.
	 */
	private PolicyLeaveUsageLookup usageOn(LocalDate takenOn, float days) {
		return (from, to) -> takenOn.isBefore(from) || takenOn.isAfter(to) ? 0f : days;
	}

	@Nested
	@DisplayName("resolveCycle - anchored on the organization's leave cycle")
	class ResolveCycle {

		@Test
		@DisplayName("Calendar year anchor - cycle runs 1 January to 31 December")
		void resolveCycle_CalendarYearAnchor_RunsJanuaryToDecember() {
			PolicyLeaveDateWindowDto cycle = PolicyLeaveAccrualUtil.resolveCycle(2026, CALENDAR_YEAR);

			assertEquals(LocalDate.of(2026, 1, 1), cycle.getStartDate());
			assertEquals(LocalDate.of(2026, 12, 31), cycle.getEndDate());
		}

		@Test
		@DisplayName("April anchor - cycle runs 1 April to 31 March of the next year")
		void resolveCycle_AprilAnchor_RunsAprilToMarch() {
			PolicyLeaveDateWindowDto cycle = PolicyLeaveAccrualUtil.resolveCycle(2026, APRIL_CYCLE);

			assertEquals(LocalDate.of(2026, 4, 1), cycle.getStartDate());
			assertEquals(LocalDate.of(2027, 3, 31), cycle.getEndDate());
		}

		@Test
		@DisplayName("Null anchor - falls back to the calendar year")
		void resolveCycle_NullAnchor_FallsBackToCalendarYear() {
			PolicyLeaveDateWindowDto cycle = PolicyLeaveAccrualUtil.resolveCycle(2026, null);

			assertEquals(LocalDate.of(2026, 1, 1), cycle.getStartDate());
			assertEquals(LocalDate.of(2026, 12, 31), cycle.getEndDate());
		}

		@Test
		@DisplayName("Date before the April anchor - belongs to the previous cycle")
		void resolveCycleContaining_DateBeforeAnchor_BelongsToPreviousCycle() {
			PolicyLeaveDateWindowDto cycle = PolicyLeaveAccrualUtil
				.resolveCycleContaining(LocalDate.of(2026, 2, 10), APRIL_CYCLE);

			assertEquals(LocalDate.of(2025, 4, 1), cycle.getStartDate());
			assertEquals(LocalDate.of(2026, 3, 31), cycle.getEndDate());
		}

		@Test
		@DisplayName("Date on the April anchor - belongs to the cycle it opens")
		void resolveCycleContaining_DateOnAnchor_BelongsToOpenedCycle() {
			PolicyLeaveDateWindowDto cycle = PolicyLeaveAccrualUtil
				.resolveCycleContaining(LocalDate.of(2026, 4, 1), APRIL_CYCLE);

			assertEquals(LocalDate.of(2026, 4, 1), cycle.getStartDate());
		}

	}

	@Nested
	@DisplayName("capCarryover - the policy's maximum carryover days")
	class CapCarryover {

		@Test
		@DisplayName("Unused days above the maximum - capped at the maximum")
		void capCarryover_AboveMaximum_CappedAtMaximum() {
			assertEquals(5f, PolicyLeaveAccrualUtil.capCarryover(yearlyPolicy(true, null, 5f), 8f));
		}

		@Test
		@DisplayName("Unused days below the maximum - carried over in full")
		void capCarryover_BelowMaximum_CarriedOverInFull() {
			assertEquals(3f, PolicyLeaveAccrualUtil.capCarryover(yearlyPolicy(true, null, 5f), 3f));
		}

		@Test
		@DisplayName("No maximum configured - every unused day is carried over")
		void capCarryover_NoMaximum_CarriesEverything() {
			assertEquals(8f, PolicyLeaveAccrualUtil.capCarryover(yearlyPolicy(true, null, null), 8f));
		}

		@Test
		@DisplayName("Negative unused days - carries nothing")
		void capCarryover_NegativeUnusedDays_CarriesNothing() {
			assertEquals(0f, PolicyLeaveAccrualUtil.capCarryover(yearlyPolicy(true, null, 5f), -2f));
		}

	}

	@Nested
	@DisplayName("resolveCarryoverExpiry - month-day resolved against the carryover cycle")
	class ResolveCarryoverExpiry {

		@Test
		@DisplayName("Expiry inside a calendar year cycle - resolved in the cycle's year")
		void resolveCarryoverExpiry_InsideCycle_ResolvedInCycleYear() {
			LocalDate expiresOn = PolicyLeaveAccrualUtil.resolveCarryoverExpiry(yearlyPolicy(true, "03-31", 5f),
					PolicyLeaveAccrualUtil.resolveCycle(2026, CALENDAR_YEAR));

			assertEquals(LocalDate.of(2026, 3, 31), expiresOn);
		}

		@Test
		@DisplayName("Expiry before an April cycle starts - rolls into the next year")
		void resolveCarryoverExpiry_BeforeCycleStart_RollsToNextYear() {
			LocalDate expiresOn = PolicyLeaveAccrualUtil.resolveCarryoverExpiry(yearlyPolicy(true, "03-31", 5f),
					PolicyLeaveAccrualUtil.resolveCycle(2026, APRIL_CYCLE));

			assertEquals(LocalDate.of(2027, 3, 31), expiresOn);
		}

		@Test
		@DisplayName("Blank expiry - carried over days never expire")
		void resolveCarryoverExpiry_BlankExpiry_NeverExpires() {
			LeavePolicy policy = yearlyPolicy(true, null, 5f);

			assertNull(PolicyLeaveAccrualUtil.resolveCarryoverExpiry(policy,
					PolicyLeaveAccrualUtil.resolveCycle(2026, CALENDAR_YEAR)));
			assertTrue(PolicyLeaveAccrualUtil.neverExpires(policy));
		}

	}

	@Nested
	@DisplayName("carriedOverInto - days handed over by the previous cycle")
	class CarriedOverInto {

		@Test
		@DisplayName("Carryover disabled - nothing is carried over")
		void carriedOverInto_CarryoverDisabled_CarriesNothing() {
			float carriedOverDays = PolicyLeaveAccrualUtil.carriedOverInto(yearlyPolicy(false, "03-31", 5f),
					LocalDate.of(2020, 1, 1), PolicyLeaveAccrualUtil.resolveCycle(2026, CALENDAR_YEAR), CALENDAR_YEAR,
					noUsage());

			assertEquals(0f, carriedOverDays);
		}

		@Test
		@DisplayName("Unused prior balance above the maximum - capped at the end of the cycle")
		void carriedOverInto_UnusedAboveMaximum_CappedAtCycleEnd() {
			float carriedOverDays = PolicyLeaveAccrualUtil.carriedOverInto(yearlyPolicy(true, "03-31", 5f),
					LocalDate.of(2025, 1, 1), PolicyLeaveAccrualUtil.resolveCycle(2026, CALENDAR_YEAR), CALENDAR_YEAR,
					noUsage());

			assertEquals(5f, carriedOverDays);
		}

		@Test
		@DisplayName("Assignment starts in the evaluated cycle - nothing to carry over")
		void carriedOverInto_FirstCycle_CarriesNothing() {
			float carriedOverDays = PolicyLeaveAccrualUtil.carriedOverInto(yearlyPolicy(true, "03-31", 5f),
					LocalDate.of(2026, 2, 1), PolicyLeaveAccrualUtil.resolveCycle(2026, CALENDAR_YEAR), CALENDAR_YEAR,
					noUsage());

			assertEquals(0f, carriedOverDays);
		}

		@Test
		@DisplayName("Prior cycle usage reduces what is carried over")
		void carriedOverInto_PriorCycleUsage_ReducesCarryover() {
			float carriedOverDays = PolicyLeaveAccrualUtil.carriedOverInto(yearlyPolicy(true, "03-31", 20f),
					LocalDate.of(2025, 1, 1), PolicyLeaveAccrualUtil.resolveCycle(2026, CALENDAR_YEAR), CALENDAR_YEAR,
					usageOn(LocalDate.of(2025, 6, 1), 4f));

			assertEquals(8f, carriedOverDays);
		}

		@Test
		@DisplayName("Never expiring carryover - compounds across cycles up to the maximum")
		void carriedOverInto_NeverExpires_CompoundsAcrossCycles() {
			float carriedOverDays = PolicyLeaveAccrualUtil.carriedOverInto(yearlyPolicy(true, null, 20f),
					LocalDate.of(2024, 1, 1), PolicyLeaveAccrualUtil.resolveCycle(2026, CALENDAR_YEAR), CALENDAR_YEAR,
					noUsage());

			assertEquals(20f, carriedOverDays);
		}

	}

	@Nested
	@DisplayName("usableCarryoverDays - carryover is drawn before newly accrued days")
	class UsableCarryoverDays {

		private final LeavePolicy policy = yearlyPolicy(true, "03-31", 5f);

		private final PolicyLeaveDateWindowDto cycle = PolicyLeaveAccrualUtil.resolveCycle(2026, CALENDAR_YEAR);

		@Test
		@DisplayName("Before the expiry date - the whole carryover is available")
		void usableCarryoverDays_BeforeExpiry_WholeCarryoverAvailable() {
			float usableCarryoverDays = PolicyLeaveAccrualUtil.usableCarryoverDays(policy, cycle, 5f,
					LocalDate.of(2026, 2, 15), usageOn(LocalDate.of(2026, 2, 10), 2f));

			assertEquals(5f, usableCarryoverDays);
		}

		@Test
		@DisplayName("On the expiry date - the whole carryover is still available")
		void usableCarryoverDays_OnExpiry_WholeCarryoverAvailable() {
			float usableCarryoverDays = PolicyLeaveAccrualUtil.usableCarryoverDays(policy, cycle, 5f,
					LocalDate.of(2026, 3, 31), noUsage());

			assertEquals(5f, usableCarryoverDays);
		}

		@Test
		@DisplayName("After the expiry date - only the days taken before it survive")
		void usableCarryoverDays_AfterExpiry_UnusedDaysForfeited() {
			float usableCarryoverDays = PolicyLeaveAccrualUtil.usableCarryoverDays(policy, cycle, 5f,
					LocalDate.of(2026, 4, 1), usageOn(LocalDate.of(2026, 2, 10), 3f));

			assertEquals(3f, usableCarryoverDays);
		}

		@Test
		@DisplayName("After the expiry date with leave taken later - the carryover is fully forfeited")
		void usableCarryoverDays_AfterExpiryWithLaterUsage_FullyForfeited() {
			float usableCarryoverDays = PolicyLeaveAccrualUtil.usableCarryoverDays(policy, cycle, 5f,
					LocalDate.of(2026, 6, 1), usageOn(LocalDate.of(2026, 5, 20), 3f));

			assertEquals(0f, usableCarryoverDays);
		}

		@Test
		@DisplayName("Never expiring carryover - stays available all cycle")
		void usableCarryoverDays_NeverExpires_StaysAvailable() {
			float usableCarryoverDays = PolicyLeaveAccrualUtil.usableCarryoverDays(yearlyPolicy(true, null, 5f), cycle,
					5f, LocalDate.of(2026, 12, 31), noUsage());

			assertEquals(5f, usableCarryoverDays);
		}

		@Test
		@DisplayName("Nothing carried over - nothing is usable")
		void usableCarryoverDays_NothingCarriedOver_NothingUsable() {
			float usableCarryoverDays = PolicyLeaveAccrualUtil.usableCarryoverDays(policy, cycle, 0f,
					LocalDate.of(2026, 6, 1), noUsage());

			assertEquals(0f, usableCarryoverDays);
		}

	}

}
