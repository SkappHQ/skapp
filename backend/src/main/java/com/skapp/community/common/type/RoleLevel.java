package com.skapp.community.common.type;

import lombok.Getter;

@Getter
public enum RoleLevel {

	ADMIN("Admin"), MANAGER("Manager"), SENDER("Sender"), EMPLOYEE("Employee"), GUEST("Guest"), NONE("None"),
	SALES_MANAGER("Sales Manager"), SALES_REPRESENTATIVE("Sales Representative");

	private final String displayName;

	RoleLevel(String displayName) {
		this.displayName = displayName;
	}

}
