package com.skapp.enterprise.common.type;

public enum QuartzEntityType {

	ENVELOPE, INVOICE, ENVELOPE_EXPIRATION_REMINDER;

	public static QuartzEntityType convertToUpperCase(String value) {

		return QuartzEntityType.valueOf(value.toUpperCase());

	}

}
