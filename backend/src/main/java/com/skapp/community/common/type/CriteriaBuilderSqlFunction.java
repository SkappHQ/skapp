package com.skapp.community.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CriteriaBuilderSqlFunction {

	GROUP_CONCAT("GROUP_CONCAT"), DISTINCT("DISTINCT"), CONCAT("CONCAT"), YEAR("YEAR"), DATE_FORMAT("DATE_FORMAT"),;

	private final String functionName;

}
