package com.skapp.enterprise.esignature.type;

/**
 * Enum representing BankID API operations.
 *
 * <p>
 * Used to identify which BankID endpoint is being called, primarily for error handling
 * and logging purposes.
 * </p>
 */
public enum BankIdOperation {

	AUTH("auth"),

	SIGN("sign"),

	COLLECT("collect"),

	CANCEL("cancel");

	private final String value;

	BankIdOperation(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public String getEndpoint() {
		return "/" + value;
	}

}
