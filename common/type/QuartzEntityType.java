package com.skapp.enterprise.common.type;

public enum QuartzEntityType {

	ENVELOPE;

	public static QuartzEntityType fromString(String value) {
		try {
			return QuartzEntityType.valueOf(value.toUpperCase());
		}
		catch (IllegalArgumentException | NullPointerException e) {
			return null;
		}
	}

}
