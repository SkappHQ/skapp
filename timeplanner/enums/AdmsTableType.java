package com.skapp.enterprise.timeplanner.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AdmsTableType {

	ATTLOG("ATTLOG"),

	OPERLOG("OPERLOG");

	private final String value;

	public boolean matches(String table) {
		return this.value.equalsIgnoreCase(table);
	}

}
