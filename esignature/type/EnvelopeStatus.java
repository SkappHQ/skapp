package com.skapp.enterprise.esignature.type;

import java.util.List;

public enum EnvelopeStatus {

	CREATED, IN_PROGRESS, COMPLETED, CANCELED, NEED_TO_SIGN, EXPIRING_SOON, WAITING, PENDING, DRAFT, DECLINED, EXPIRED,
	VOIDED;

	public static List<EnvelopeStatus> activeStatuses() {
		return List.of(CREATED, IN_PROGRESS, NEED_TO_SIGN, EXPIRING_SOON, WAITING, PENDING);
	}

	public static boolean isVoidProhibitedFrom(EnvelopeStatus envelopeStatus) {
		return List.of(COMPLETED, CANCELED, VOIDED, EXPIRED).contains(envelopeStatus);
	}

	public static boolean isDeclineProhibitedFrom(EnvelopeStatus envelopeStatus) {
		return List.of(COMPLETED, CANCELED, VOIDED, EXPIRED, DECLINED).contains(envelopeStatus);
	}

	public static List<EnvelopeStatus> inactiveStatuses() {
		return List.of(VOIDED, DECLINED, EXPIRED);
	}

}
