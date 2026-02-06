package com.skapp.enterprise.esignature.type;

public enum BankIdErrorCode {

	INVALID_PARAMETERS("invalidParameters"),

	NOT_FOUND("notFound"),

	ALREADY_IN_PROGRESS("alreadyInProgress"),

	INTERNAL_ERROR("internalError"),

	UNAUTHORIZED("unauthorized"),

	REQUEST_TIMEOUT("requestTimeout"),

	MAINTENANCE("maintenance");

	private final String value;

	BankIdErrorCode(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public static BankIdErrorCode fromValue(String value) {
		if (value == null) {
			return null;
		}
		for (BankIdErrorCode code : values()) {
			if (code.value.equals(value)) {
				return code;
			}
		}
		return null;
	}

}
