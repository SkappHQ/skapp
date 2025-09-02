package com.skapp.community.okrplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public enum OkrTimePeriod {

	// Annual - no specific period needed
	ANNUAL(OkrFrequency.ANNUAL, "annual"),

	// BI_ANNUAL periods
	FIRST_HALF(OkrFrequency.BI_ANNUAL, "first-half"), SECOND_HALF(OkrFrequency.BI_ANNUAL, "second-half"),

	// QUARTERLY periods
	Q1(OkrFrequency.QUARTERLY, "q1"), Q2(OkrFrequency.QUARTERLY, "q2"), Q3(OkrFrequency.QUARTERLY, "q3"),
	Q4(OkrFrequency.QUARTERLY, "q4");

	private final OkrFrequency frequency;

	private final String label;

	public static List<OkrTimePeriod> getByType(OkrFrequency type) {
		return Arrays.stream(values()).filter(period -> period.getFrequency() == type).collect(Collectors.toList());
	}

}
