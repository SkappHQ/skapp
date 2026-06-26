package com.skapp.community.timeplanner.type;

import lombok.Getter;

@Getter
public enum TimeConfigFieldName {

	TIME_BLOCK("timeBlock"), HOURS("hours");

	private final String fieldName;

	TimeConfigFieldName(String fieldName) {
		this.fieldName = fieldName;
	}

}
