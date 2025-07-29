package com.skapp.community.okrplanner.type;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public enum KeyResultType {

	IN_BETWEEN, GREATER_THAN, LESS_THAN;

	public static List<String> getAllTypes() {
		return Arrays.stream(values()).map(Enum::name).collect(Collectors.toList());
	}

}
