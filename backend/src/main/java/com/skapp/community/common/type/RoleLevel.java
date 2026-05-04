package com.skapp.community.common.type;

import lombok.Getter;

@Getter
public enum RoleLevel {

	ADMIN("Admin"), MANAGER("Manager"), SENDER("Sender"), EMPLOYEE("Employee"), GUEST("Guest"), NONE("None");

	private final String displayName;

	RoleLevel(String displayName) {
		this.displayName = displayName;
	}

}
