package com.skapp.community.leaveplanner.util;

import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.leaveplanner.payload.PolicyLeaveDateWindowDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveSpanDto;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.timeplanner.model.TimeConfig;
import lombok.experimental.UtilityClass;
import org.springframework.util.CollectionUtils;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.BiFunction;

@UtilityClass
public class PolicyLeaveAnalyticsUtil {

	public static void splitAcrossMonths(Map<Long, Map<YearMonth, Double>> durations, PolicyLeaveSpanDto span,
			PolicyLeaveDateWindowDto window, List<TimeConfig> timeConfigs, List<Holiday> holidays) {
		if (span.getDurationDays() == null) {
			return;
		}

		BiFunction<LocalDate, LocalDate, Double> dayCounter = (start,
				end) -> (double) LeaveModuleUtil.getWorkingDaysBetweenTwoDates(start, end, timeConfigs, holidays);
		double requestDays = dayCounter.apply(span.getStartDate(), span.getEndDate());
		if (requestDays <= 0) {
			dayCounter = (start, end) -> (double) (ChronoUnit.DAYS.between(start, end) + 1);
			requestDays = dayCounter.apply(span.getStartDate(), span.getEndDate());
		}

		double durationPerDay = span.getDurationDays() / requestDays;
		LocalDate from = DateTimeUtils.getLaterDate(span.getStartDate(), window.getStartDate());
		LocalDate to = DateTimeUtils.getEarlierDate(span.getEndDate(), window.getEndDate());
		YearMonth lastMonth = YearMonth.from(to);

		for (YearMonth month = YearMonth.from(from); !month.isAfter(lastMonth); month = month.plusMonths(1)) {
			double segmentDays = dayCounter.apply(DateTimeUtils.getLaterDate(from, month.atDay(1)),
					DateTimeUtils.getEarlierDate(to, month.atEndOfMonth()));
			if (segmentDays > 0) {
				addDuration(durations, span.getLeaveTypeId(), month, segmentDays * durationPerDay);
			}
		}
	}

	public static double durationWithinWindow(PolicyLeaveSpanDto span, PolicyLeaveDateWindowDto window,
			List<TimeConfig> timeConfigs, List<Holiday> holidays) {
		if (span.getDurationDays() == null) {
			return 0;
		}

		double requestDays = LeaveModuleUtil.getWorkingDaysBetweenTwoDates(span.getStartDate(), span.getEndDate(),
				timeConfigs, holidays);
		LocalDate from = DateTimeUtils.getLaterDate(span.getStartDate(), window.getStartDate());
		LocalDate to = DateTimeUtils.getEarlierDate(span.getEndDate(), window.getEndDate());
		if (requestDays <= 0 || from.isAfter(to)) {
			return 0;
		}

		double windowDays = LeaveModuleUtil.getWorkingDaysBetweenTwoDates(from, to, timeConfigs, holidays);
		return windowDays * span.getDurationDays() / requestDays;
	}

	public static List<Holiday> holidaysForWorkLocation(List<Holiday> holidays, Long workLocationId) {
		return holidays.stream()
			.filter(holiday -> holiday.getWorkLocations().isEmpty()
					|| (workLocationId != null && holiday.getWorkLocations()
						.stream()
						.anyMatch(workLocation -> workLocationId.equals(workLocation.getWorkLocationId()))))
			.toList();
	}

	public static void addDuration(Map<Long, Map<YearMonth, Double>> durations, Long leaveTypeId, YearMonth month,
			Double durationDays) {
		if (durationDays == null) {
			return;
		}
		durations.computeIfAbsent(leaveTypeId, key -> new HashMap<>()).merge(month, durationDays, Double::sum);
	}

	public static Map<YearMonth, Double> sumByMonth(Map<Long, Map<YearMonth, Double>> durations) {
		Map<YearMonth, Double> totals = new HashMap<>();
		durations.values()
			.forEach(durationsByMonth -> durationsByMonth
				.forEach((month, durationDays) -> totals.merge(month, durationDays, Double::sum)));
		return totals;
	}

	public static Map<String, Float> toMonthNameMap(PolicyLeaveDateWindowDto window,
			Map<YearMonth, Double> durationsByMonth) {
		Map<String, Float> monthNameMap = new LinkedHashMap<>();
		YearMonth lastMonth = YearMonth.from(window.getEndDate());

		for (YearMonth month = YearMonth.from(window.getStartDate()); !month.isAfter(lastMonth); month = month
			.plusMonths(1)) {
			Double durationDays = durationsByMonth == null ? null : durationsByMonth.get(month);
			monthNameMap.merge(month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
					durationDays == null ? 0f : durationDays.floatValue(), Float::sum);
		}

		return monthNameMap;
	}

	public static boolean isAllSelected(List<Long> ids, long allSelectionId) {
		return CollectionUtils.isEmpty(ids) || ids.contains(allSelectionId);
	}

}
