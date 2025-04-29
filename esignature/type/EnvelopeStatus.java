package com.skapp.enterprise.esignature.type;

import java.util.List;

public enum EnvelopeStatus {

	COMPLETED, WAITING, DECLINED, EXPIRED, VOIDED, NEED_TO_SIGN;

	public static List<EnvelopeStatus> activeStatuses() {
		return List.of(COMPLETED, WAITING);
	}

	public static boolean isVoidProhibitedFrom(EnvelopeStatus envelopeStatus) {
		return List.of(COMPLETED, VOIDED, EXPIRED, DECLINED).contains(envelopeStatus);
	}

	public static boolean isDeclineProhibitedFrom(EnvelopeStatus envelopeStatus) {
		return List.of(COMPLETED, VOIDED, EXPIRED, DECLINED).contains(envelopeStatus);
	}

	public static List<EnvelopeStatus> inactiveStatuses() {
		return List.of(VOIDED, DECLINED, EXPIRED);
	}

}
