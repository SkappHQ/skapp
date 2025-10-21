package com.skapp.enterprise.common.type;

public enum QuartzEntityType {

	ENVELOPE, INVOICE;

	public static QuartzEntityType convertToUpperCase(String value) {

		return QuartzEntityType.valueOf(value.toUpperCase());

	}

}
