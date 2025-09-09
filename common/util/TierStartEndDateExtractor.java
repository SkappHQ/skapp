package com.skapp.enterprise.common.util;

import com.skapp.community.common.util.DateTimeUtils;
import lombok.experimental.UtilityClass;

import java.time.LocalDate;
import java.time.LocalDateTime;

@UtilityClass
public class TierStartEndDateExtractor {

	private static final int LEAP_DAY = 29;

	private static final java.time.Month FEBRUARY = java.time.Month.FEBRUARY;

	private static final java.time.Month MARCH = java.time.Month.MARCH;

	private static final int FIRST_DAY = 1;

	public LocalDateTime getYearlyTierStartDate(LocalDate tierStartedDate) {
		LocalDate today = DateTimeUtils.getCurrentUtcDate();
		int year = today.getYear();
		LocalDate thisYearStart = getCurrentYearStartDate(tierStartedDate, year);
		if (today.isBefore(thisYearStart)) {
			thisYearStart = getCurrentYearStartDate(tierStartedDate, year - 1);
		}
		return thisYearStart.atStartOfDay();
	}

	private LocalDate getCurrentYearStartDate(LocalDate tierStartedDate, int year) {
		int month = tierStartedDate.getMonthValue();
		int day = tierStartedDate.getDayOfMonth();
		if (month == FEBRUARY.getValue() && day == LEAP_DAY) {
			return java.time.Year.isLeap(year) ? LocalDate.of(year, FEBRUARY, LEAP_DAY)
					: LocalDate.of(year, MARCH, FIRST_DAY);
		}
		else {
			return LocalDate.of(year, month, day);
		}
	}

	public LocalDateTime getYearlyTierEndDate(LocalDateTime startDateTime, LocalDate tierStartedDate) {
		int year = startDateTime.getYear() + 1;
		if (tierStartedDate.getMonthValue() == FEBRUARY.getValue() && tierStartedDate.getDayOfMonth() == LEAP_DAY) {
			if (java.time.Year.isLeap(year)) {
				return LocalDate.of(year, FEBRUARY, LEAP_DAY).atStartOfDay();
			}
			else {
				return LocalDate.of(year, MARCH, FIRST_DAY).atStartOfDay();
			}
		}
		else {
			return startDateTime.plusYears(1);
		}
	}

}
