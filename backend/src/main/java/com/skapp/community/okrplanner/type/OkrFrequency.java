package com.skapp.community.okrplanner.type;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public enum OkrFrequency {

	ANNUAL, BI_ANNUAL, QUARTERLY;

	public static List<String> getAll() {
		return Arrays.stream(values()).map(Enum::name).collect(Collectors.toList());
	}

}
