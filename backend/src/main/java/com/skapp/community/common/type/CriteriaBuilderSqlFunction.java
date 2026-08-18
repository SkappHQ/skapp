package com.skapp.community.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CriteriaBuilderSqlFunction {

	GROUP_CONCAT("GROUP_CONCAT"), DISTINCT("DISTINCT"), CONCAT("CONCAT"), YEAR("YEAR"), DATE_FORMAT("DATE_FORMAT"),
	MONTH("MONTH"), DAY("DAY"),;

	private final String functionName;

}
