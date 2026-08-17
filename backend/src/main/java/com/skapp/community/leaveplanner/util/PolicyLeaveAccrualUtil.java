package com.skapp.community.leaveplanner.util;

import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.leaveplanner.constant.LeavePolicyConstant;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.payload.PolicyLeaveDateWindowDto;
import com.skapp.community.leaveplanner.type.AccrualFrequency;
import com.skapp.community.leaveplanner.type.AccrualTiming;
import com.skapp.community.leaveplanner.type.FirstAccrualType;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.MonthDay;
import java.time.temporal.ChronoUnit;

@Slf4j
@UtilityClass
public class PolicyLeaveAccrualUtil {

	public static LocalDate resolveAccrualStartDate(LeavePolicy policy, LocalDate effectiveFrom) {
		Integer waitingPeriodDays = policy.getWaitingPeriodDays();
		if (waitingPeriodDays == null || waitingPeriodDays <= 0) {
			return effectiveFrom;
		}
		return effectiveFrom.plusDays(waitingPeriodDays);
	}

	public static PolicyLeaveDateWindowDto resolveCycle(int year, MonthDay cycleStart) {
		MonthDay anchor = cycleStart == null ? DateTimeUtils.CALENDAR_YEAR_START : cycleStart;
		return new PolicyLeaveDateWindowDto(anchor.atYear(year), anchor.atYear(year + 1).minusDays(1));
	}

	public static PolicyLeaveDateWindowDto resolveCycleContaining(LocalDate date, MonthDay cycleStart) {
		MonthDay anchor = cycleStart == null ? DateTimeUtils.CALENDAR_YEAR_START : cycleStart;
		int year = date.isBefore(anchor.atYear(date.getYear())) ? date.getYear() - 1 : date.getYear();
		return resolveCycle(year, anchor);
	}

	private static float accruedUpTo(LeavePolicy policy, LocalDate accrualStartDate, LocalDate asOf) {
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
		boolean isFirstPeriod = true;
		PolicyLeaveDateWindowDto period = resolvePeriodContaining(policy.getFrequency(), accrualStartDate,
				accrualStartDate);
		LocalDate creditDate = creditAtPeriodStart ? period.getStartDate() : period.getEndDate();

		while (!creditDate.isAfter(asOf)) {
			float credited = accrualDays;
			if (isFirstPeriod && prorateFirstPeriod) {
				credited = accrualDays * proration(period, accrualStartDate);
			}
			total += credited;
			isFirstPeriod = false;

			PolicyLeaveDateWindowDto nextPeriod = resolvePeriodContaining(policy.getFrequency(), accrualStartDate,
					period.getEndDate().plusDays(1));
			if (!nextPeriod.getStartDate().isAfter(period.getStartDate())) {
				log.warn("accruedUpTo: accrual period failed to advance, stopping walk");
				break;
			}
			period = nextPeriod;
			creditDate = creditAtPeriodStart ? period.getStartDate() : period.getEndDate();
		}

		return total;
	}

	public static float accruedWithinCycle(LeavePolicy policy, LocalDate accrualStartDate,
			PolicyLeaveDateWindowDto cycle, LocalDate asOf) {
		LocalDate windowEnd = asOf.isBefore(cycle.getEndDate()) ? asOf : cycle.getEndDate();
		if (windowEnd.isBefore(cycle.getStartDate())) {
			return 0f;
		}
		float upToWindowEnd = accruedUpTo(policy, accrualStartDate, windowEnd);
		float upToCycleStart = accruedUpTo(policy, accrualStartDate, cycle.getStartDate().minusDays(1));
		return Math.max(0f, upToWindowEnd - upToCycleStart);
	}

	public static float roundToHalfDay(float value) {
		return Math.round(value * 2f) / 2f;
	}

	public static float applyAccrualCap(LeavePolicy policy, float totalDaysAllocated) {
		Float cap = policy.getAccrualCapDays();
		if (cap == null) {
			return totalDaysAllocated;
		}
		return Math.min(totalDaysAllocated, cap);
	}

	private static float capCarryover(LeavePolicy policy, float unusedDays) {
		float carriedOverDays = Math.max(0f, unusedDays);
		Float maxCarryoverDays = policy.getMaxCarryoverDays();
		return maxCarryoverDays == null ? carriedOverDays : Math.min(carriedOverDays, maxCarryoverDays);
	}

	private static LocalDate resolveCarryoverExpiry(LeavePolicy policy, PolicyLeaveDateWindowDto cycle) {
		if (neverExpires(policy)) {
			return null;
		}
		MonthDay monthDay = DateTimeUtils.parseMonthDay(policy.getCarryoverExpiryDate());
		LocalDate expiresOn = monthDay.atYear(cycle.getStartDate().getYear());
		if (expiresOn.isBefore(cycle.getStartDate())) {
			expiresOn = monthDay.atYear(cycle.getStartDate().getYear() + 1);
		}
		return expiresOn.isAfter(cycle.getEndDate()) ? cycle.getEndDate() : expiresOn;
	}

	private static boolean neverExpires(LeavePolicy policy) {
		return !DateTimeUtils.isValidMonthDay(policy.getCarryoverExpiryDate());
	}

	public static float carriedOverInto(LeavePolicy policy, LocalDate effectiveFrom, PolicyLeaveDateWindowDto cycle,
			MonthDay cycleAnchor, PolicyLeaveUsageLookup usageLookup) {
		if (!Boolean.TRUE.equals(policy.getIsCarryoverEnabled())) {
			return 0f;
		}

		int targetYear = cycle.getStartDate().getYear();
		int firstYear = resolveCycleContaining(effectiveFrom, cycleAnchor).getStartDate().getYear();
		int fromYear = Math.max(firstYear, targetYear - LeavePolicyConstant.MAX_CARRYOVER_LOOKBACK_CYCLES);

		float carriedOverDays = 0f;
		for (int year = fromYear; year < targetYear; year++) {
			PolicyLeaveDateWindowDto priorCycle = resolveCycle(year, cycleAnchor);
			carriedOverDays = capCarryover(policy,
					unusedAtCycleEnd(policy, effectiveFrom, priorCycle, carriedOverDays, usageLookup));
		}
		return carriedOverDays;
	}

	public static float usableCarryoverDays(LeavePolicy policy, PolicyLeaveDateWindowDto cycle, float carriedOverDays,
			LocalDate asOf, PolicyLeaveUsageLookup usageLookup) {
		if (carriedOverDays <= 0f) {
			return 0f;
		}

		LocalDate expiresOn = resolveCarryoverExpiry(policy, cycle);
		if (expiresOn == null || !asOf.isAfter(expiresOn)) {
			return carriedOverDays;
		}
		return Math.min(carriedOverDays, usageLookup.usedBetween(cycle.getStartDate(), expiresOn));
	}

	private static float unusedAtCycleEnd(LeavePolicy policy, LocalDate effectiveFrom, PolicyLeaveDateWindowDto cycle,
			float carriedOverDays, PolicyLeaveUsageLookup usageLookup) {
		if (cycle.getEndDate().isBefore(effectiveFrom)) {
			return 0f;
		}

		float accrualAllocation = accrualAllocationInCycle(policy, effectiveFrom, cycle);
		float usableCarryoverDays = usableCarryoverDays(policy, cycle, carriedOverDays, cycle.getEndDate(),
				usageLookup);
		float totalDaysUsed = usageLookup.usedBetween(cycle.getStartDate(), cycle.getEndDate());
		return Math.max(0f, accrualAllocation + usableCarryoverDays - totalDaysUsed);
	}

	public static float accrualAllocationInCycle(LeavePolicy policy, LocalDate effectiveFrom,
			PolicyLeaveDateWindowDto cycle) {
		LocalDate accrualStartDate = resolveAccrualStartDate(policy, effectiveFrom);
		return applyAccrualCap(policy,
				roundToHalfDay(accruedWithinCycle(policy, accrualStartDate, cycle, cycle.getEndDate())));
	}

	private static float proration(PolicyLeaveDateWindowDto period, LocalDate accrualStartDate) {
		if (!accrualStartDate.isAfter(period.getStartDate())) {
			return 1f;
		}
		long periodLength = ChronoUnit.DAYS.between(period.getStartDate(), period.getEndDate()) + 1;
		long earnedLength = ChronoUnit.DAYS.between(accrualStartDate, period.getEndDate()) + 1;
		if (periodLength <= 0 || earnedLength <= 0) {
			return 0f;
		}
		return (float) earnedLength / (float) periodLength;
	}

	private static PolicyLeaveDateWindowDto resolvePeriodContaining(AccrualFrequency frequency,
			LocalDate accrualStartDate, LocalDate date) {
		return switch (frequency) {
			case DAILY -> new PolicyLeaveDateWindowDto(date, date);
			case WEEKLY -> weekWindow(date);
			case EVERY_OTHER_WEEK -> fortnightWindow(accrualStartDate, date);
			case TWICE_A_MONTH -> twiceAMonthWindow(date);
			case MONTHLY ->
				new PolicyLeaveDateWindowDto(date.withDayOfMonth(1), date.withDayOfMonth(date.lengthOfMonth()));
			case QUARTERLY -> quarterWindow(date);
			case TWICE_A_YEAR -> halfYearWindow(date);
			case YEARLY -> new PolicyLeaveDateWindowDto(date.withDayOfYear(1), date.withDayOfYear(date.lengthOfYear()));
			case ON_ANNIVERSARY -> anniversaryWindow(accrualStartDate, date);
		};
	}

	private static PolicyLeaveDateWindowDto weekWindow(LocalDate date) {
		LocalDate start = date.minusDays(date.getDayOfWeek().getValue() - 1L);
		return new PolicyLeaveDateWindowDto(start, start.plusWeeks(1).minusDays(1));
	}

	private static PolicyLeaveDateWindowDto fortnightWindow(LocalDate accrualStartDate, LocalDate date) {
		LocalDate anchor = accrualStartDate.minusDays(accrualStartDate.getDayOfWeek().getValue() - 1L);
		long weeksElapsed = ChronoUnit.WEEKS.between(anchor, date);
		LocalDate start = anchor.plusWeeks(weeksElapsed - Math.floorMod(weeksElapsed, 2L));
		return new PolicyLeaveDateWindowDto(start, start.plusWeeks(2).minusDays(1));
	}

	private static PolicyLeaveDateWindowDto twiceAMonthWindow(LocalDate date) {
		if (date.getDayOfMonth() <= 15) {
			return new PolicyLeaveDateWindowDto(date.withDayOfMonth(1), date.withDayOfMonth(15));
		}
		return new PolicyLeaveDateWindowDto(date.withDayOfMonth(16), date.withDayOfMonth(date.lengthOfMonth()));
	}

	private static PolicyLeaveDateWindowDto quarterWindow(LocalDate date) {
		int firstMonthOfQuarter = ((date.getMonthValue() - 1) / 3) * 3 + 1;
		LocalDate start = LocalDate.of(date.getYear(), firstMonthOfQuarter, 1);
		return new PolicyLeaveDateWindowDto(start, start.plusMonths(3).minusDays(1));
	}

	private static PolicyLeaveDateWindowDto halfYearWindow(LocalDate date) {
		int firstMonthOfHalf = date.getMonthValue() <= 6 ? 1 : 7;
		LocalDate start = LocalDate.of(date.getYear(), firstMonthOfHalf, 1);
		return new PolicyLeaveDateWindowDto(start, start.plusMonths(6).minusDays(1));
	}

	private static PolicyLeaveDateWindowDto anniversaryWindow(LocalDate accrualStartDate, LocalDate date) {
		long yearsElapsed = ChronoUnit.YEARS.between(accrualStartDate, date);
		while (yearsElapsed > 0 && accrualStartDate.plusYears(yearsElapsed).isAfter(date)) {
			yearsElapsed--;
		}
		while (!accrualStartDate.plusYears(yearsElapsed + 1).isAfter(date)) {
			yearsElapsed++;
		}
		return new PolicyLeaveDateWindowDto(accrualStartDate.plusYears(yearsElapsed),
				accrualStartDate.plusYears(yearsElapsed + 1).minusDays(1));
	}

}
