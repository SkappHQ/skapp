package com.skapp.enterprise.esignature.type;

public enum BankIdStatus {

	PENDING("pending"),

	FAILED("failed"),

	COMPLETE("complete");

	private final String value;

	BankIdStatus(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public static BankIdStatus fromValue(String value) {
		if (value == null) {
			return null;
		}
		for (BankIdStatus status : values()) {
			if (status.value.equals(value)) {
				return status;
			}
		}
		return null;
	}

}
