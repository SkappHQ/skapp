package com.skapp.community.leaveplanner.util;

import com.skapp.community.leaveplanner.constant.PolicyLeaveConstant;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.type.AccrualFrequency;
import com.skapp.community.leaveplanner.type.AccrualTiming;
import com.skapp.community.leaveplanner.type.FirstAccrualType;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.MonthDay;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * Pure accrual arithmetic for leave policies. Policy balances are not persisted anywhere;
 * they are derived at read time from the policy's accrual configuration plus the
 * assignment's effective-from date. Everything in here is deterministic and side-effect
 * free so it can be reused by the balance endpoint, the availability pre-check and the
 * apply-leave server-side re-check without any risk of the three disagreeing.
 */
@Slf4j
@UtilityClass
public class PolicyLeaveAccrualUtil {

	private static final DateTimeFormatter CARRYOVER_DATE_FORMATTER = DateTimeFormatter.ofPattern("MM-dd");

	/**
	 * A closed date window; used both for accrual periods and for policy cycles.
	 */
	public record DateWindow(LocalDate start, LocalDate end) {
		public boolean contains(LocalDate date) {
			return !date.isBefore(start) && !date.isAfter(end);
		}
	}

	/**
	 * The date from which the policy starts earning days for this employee — the
	 * assignment's effective date pushed out by the configured waiting period.
	 */
	public static LocalDate resolveAccrualStartDate(LeavePolicy policy, LocalDate effectiveFrom) {
		Integer waitingPeriodDays = policy.getWaitingPeriodDays();
		if (waitingPeriodDays == null || waitingPeriodDays <= 0) {
			return effectiveFrom;
		}
		return effectiveFrom.plusDays(waitingPeriodDays);
	}

	/**
	 * The cycle window a policy runs on for the given year. When carryover is enabled the
	 * cycle is anchored on the policy's carryover date; otherwise it is the calendar year.
	 */
	public static DateWindow resolveCycle(LeavePolicy policy, int year) {
		MonthDay anchor = resolveCycleAnchor(policy);
		LocalDate start = anchor.atYear(year);
		LocalDate end = anchor.atYear(year + 1).minusDays(1);
		return new DateWindow(start, end);
	}

	/**
	 * The cycle window containing the given date.
	 */
	public static DateWindow resolveCycleContaining(LeavePolicy policy, LocalDate date) {
		DateWindow cycle = resolveCycle(policy, date.getYear());
		if (date.isBefore(cycle.start())) {
			return resolveCycle(policy, date.getYear() - 1);
		}
		return cycle;
	}

	/**
	 * Total days accrued from the accrual start date up to and including {@code asOf}.
	 * Uncapped — {@code accrualCapDays} is a ceiling on the balance you may hold, so it is
	 * applied once per cycle in {@code PolicyLeaveBalanceCalculator}, not to this running
	 * lifetime total (which would permanently halt accrual once the cap was first hit).
	 * Returns 0 for non-accrual policies and for dates before the waiting period elapses.
	 */
	public static float accruedUpTo(LeavePolicy policy, LocalDate accrualStartDate, LocalDate asOf) {
		if (policy.getAccrualDays() == null || policy.getFrequency() == null) {
			return 0f;
		}
		if (asOf.isBefore(accrualStartDate)) {
			return 0f;
		}

		float accrualDays = policy.getAccrualDays();
		boolean creditAtPeriodStart = policy.getAccrualTiming() == AccrualTiming.PERIOD_START;
		boolean prorateFirstPeriod = policy.getFirstAccrual() != FirstAccrualType.FULL;

		float total = 0f;
		DateWindow period = resolvePeriodContaining(policy.getFrequency(), accrualStartDate, accrualStartDate);
		boolean isFirstPeriod = true;

		for (int guard = 0; guard < PolicyLeaveConstant.MAX_ACCRUAL_PERIODS; guard++) {
			LocalDate creditDate = creditAtPeriodStart ? period.start() : period.end();
			if (creditDate.isAfter(asOf)) {
				break;
			}

			float credited = accrualDays;
			if (isFirstPeriod && prorateFirstPeriod) {
				credited = accrualDays * proration(period, accrualStartDate);
			}
			total += credited;

			isFirstPeriod = false;

			DateWindow nextPeriod = resolvePeriodContaining(policy.getFrequency(), accrualStartDate,
					period.end().plusDays(1));
			if (!nextPeriod.start().isAfter(period.start())) {
				log.warn("accruedUpTo: accrual period failed to advance past {} for policy {}, stopping walk",
						period.end(), policy.getId());
				break;
			}
			period = nextPeriod;
		}

		return total;
	}

	/**
	 * Days accrued inside a single cycle window.
	 */
	public static float accruedWithinCycle(LeavePolicy policy, LocalDate accrualStartDate, DateWindow cycle,
			LocalDate asOf) {
		LocalDate windowEnd = asOf.isBefore(cycle.end()) ? asOf : cycle.end();
		if (windowEnd.isBefore(cycle.start())) {
			return 0f;
		}
		float upToWindowEnd = accruedUpTo(policy, accrualStartDate, windowEnd);
		float upToCycleStart = accruedUpTo(policy, accrualStartDate, cycle.start().minusDays(1));
		return Math.max(0f, upToWindowEnd - upToCycleStart);
	}

	/**
	 * Days carried into a cycle from the one before it, capped at the policy's max
	 * carryover. Zero when carryover is disabled — unused days are simply forfeited.
	 */
	public static float capCarryover(LeavePolicy policy, float closingBalance) {
		if (!Boolean.TRUE.equals(policy.getIsCarryoverEnabled()) || closingBalance <= 0f) {
			return 0f;
		}
		Float maxCarryoverDays = policy.getMaxCarryoverDays();
		if (maxCarryoverDays == null) {
			return closingBalance;
		}
		return Math.min(closingBalance, maxCarryoverDays);
	}

	/**
	 * Rounds to the nearest half day so derived balances line up with the half-day
	 * granularity leave is actually taken in, and never surface float noise like 12.499998.
	 */
	public static float roundToHalfDay(float value) {
		return Math.round(value * 2f) / 2f;
	}

	/**
	 * Ceiling on the balance an employee may hold on the policy at any one time.
	 */
	public static float applyAccrualCap(LeavePolicy policy, float totalDaysAllocated) {
		Float cap = policy.getAccrualCapDays();
		if (cap == null) {
			return totalDaysAllocated;
		}
		return Math.min(totalDaysAllocated, cap);
	}

	private static float proration(DateWindow period, LocalDate accrualStartDate) {
		if (!accrualStartDate.isAfter(period.start())) {
			return 1f;
		}
		long periodLength = ChronoUnit.DAYS.between(period.start(), period.end()) + 1;
		long earnedLength = ChronoUnit.DAYS.between(accrualStartDate, period.end()) + 1;
		if (periodLength <= 0 || earnedLength <= 0) {
			return 0f;
		}
		return (float) earnedLength / (float) periodLength;
	}

	private static MonthDay resolveCycleAnchor(LeavePolicy policy) {
		if (!Boolean.TRUE.equals(policy.getIsCarryoverEnabled())) {
			return MonthDay.of(1, 1);
		}
		String carryoverDate = policy.getCarryoverDate();
		if (carryoverDate == null || carryoverDate.isBlank()) {
			return MonthDay.of(1, 1);
		}
		try {
			return MonthDay.parse(carryoverDate, CARRYOVER_DATE_FORMATTER);
		}
		catch (Exception exception) {
			log.warn("resolveCycleAnchor: unparseable carryover date '{}' on policy {}, defaulting to 01-01",
					carryoverDate, policy.getId());
			return MonthDay.of(1, 1);
		}
	}

	/**
	 * The accrual period containing {@code date}. Periods are anchored on the calendar for
	 * every frequency except ON_ANNIVERSARY, which is anchored on the accrual start date.
	 */
	private static DateWindow resolvePeriodContaining(AccrualFrequency frequency, LocalDate accrualStartDate,
			LocalDate date) {
		return switch (frequency) {
			case DAILY -> new DateWindow(date, date);
			case WEEKLY -> weekWindow(date, 1);
			case EVERY_OTHER_WEEK -> fortnightWindow(accrualStartDate, date);
			case TWICE_A_MONTH -> twiceAMonthWindow(date);
			case MONTHLY -> new DateWindow(date.withDayOfMonth(1), date.withDayOfMonth(date.lengthOfMonth()));
			case QUARTERLY -> quarterWindow(date);
			case TWICE_A_YEAR -> halfYearWindow(date);
			case YEARLY -> new DateWindow(date.withDayOfYear(1), date.withDayOfYear(date.lengthOfYear()));
			case ON_ANNIVERSARY -> anniversaryWindow(accrualStartDate, date);
		};
	}

	private static DateWindow weekWindow(LocalDate date, int weeks) {
		LocalDate start = date.minusDays(date.getDayOfWeek().getValue() - 1L);
		return new DateWindow(start, start.plusWeeks(weeks).minusDays(1));
	}

	private static DateWindow fortnightWindow(LocalDate accrualStartDate, LocalDate date) {
		LocalDate anchor = accrualStartDate.minusDays(accrualStartDate.getDayOfWeek().getValue() - 1L);
		long weeksElapsed = ChronoUnit.WEEKS.between(anchor, date);
		LocalDate start = anchor.plusWeeks(weeksElapsed - Math.floorMod(weeksElapsed, 2L));
		return new DateWindow(start, start.plusWeeks(2).minusDays(1));
	}

	private static DateWindow twiceAMonthWindow(LocalDate date) {
		if (date.getDayOfMonth() <= 15) {
			return new DateWindow(date.withDayOfMonth(1), date.withDayOfMonth(15));
		}
		return new DateWindow(date.withDayOfMonth(16), date.withDayOfMonth(date.lengthOfMonth()));
	}

	private static DateWindow quarterWindow(LocalDate date) {
		int firstMonthOfQuarter = ((date.getMonthValue() - 1) / 3) * 3 + 1;
		LocalDate start = LocalDate.of(date.getYear(), firstMonthOfQuarter, 1);
		return new DateWindow(start, start.plusMonths(3).minusDays(1));
	}

	private static DateWindow halfYearWindow(LocalDate date) {
		int firstMonthOfHalf = date.getMonthValue() <= 6 ? 1 : 7;
		LocalDate start = LocalDate.of(date.getYear(), firstMonthOfHalf, 1);
		return new DateWindow(start, start.plusMonths(6).minusDays(1));
	}

	/**
	 * Anniversary periods are derived from a single year offset so consecutive windows
	 * stay contiguous. Around a Feb-29 accrual start {@code plusYears} clamps to Feb-28,
	 * which makes {@code ChronoUnit.YEARS} disagree with it by one in either direction —
	 * so the estimate is corrected both ways. Without this, the walk in
	 * {@link #accruedUpTo} revisits the same window and never advances past 2025 for a
	 * 2024-02-29 start.
	 */
	private static DateWindow anniversaryWindow(LocalDate accrualStartDate, LocalDate date) {
		long yearsElapsed = ChronoUnit.YEARS.between(accrualStartDate, date);
		while (yearsElapsed > 0 && accrualStartDate.plusYears(yearsElapsed).isAfter(date)) {
			yearsElapsed--;
		}
		while (!accrualStartDate.plusYears(yearsElapsed + 1).isAfter(date)) {
			yearsElapsed++;
		}
		return new DateWindow(accrualStartDate.plusYears(yearsElapsed),
				accrualStartDate.plusYears(yearsElapsed + 1).minusDays(1));
	}

}
