package com.skapp.enterprise.timeplanner.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AdmsResponse {

	OK("OK"),

	ERROR("ERROR");

	private final String value;

	public String withCount(int count) {
		return this.value + ": " + count;
	}

}
