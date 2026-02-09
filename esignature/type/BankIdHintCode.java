package com.skapp.enterprise.esignature.type;

public enum BankIdHintCode {

	// Pending hint codes
	OUTSTANDING_TRANSACTION("outstandingTransaction"),

	NO_CLIENT("noClient"),

	STARTED("started"),

	USER_SIGN("userSign"),

	USER_MRTD("userMrtd"),

	// Failed hint codes
	EXPIRED_TRANSACTION("expiredTransaction"),

	CERTIFICATE_ERR("certificateErr"),

	USER_CANCEL("userCancel"),

	CANCELLED("cancelled"),

	START_FAILED("startFailed"),

	USER_DECLINED_CALL("userDeclinedCall"),

	TRANSACTION_EXPIRED("transactionExpired");

	private final String value;

	BankIdHintCode(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public static BankIdHintCode fromValue(String value) {
		if (value == null) {
			return null;
		}
		for (BankIdHintCode code : values()) {
			if (code.value.equals(value)) {
				return code;
			}
		}
		return null;
	}

}
