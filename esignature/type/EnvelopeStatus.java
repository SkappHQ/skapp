package com.skapp.enterprise.esignature.type;

import java.util.List;

public enum EnvelopeStatus {

	CREATED, IN_PROGRESS, COMPLETED, CANCELED, NEED_TO_SIGN, EXPIRING_SOON, WAITING_FOR_OTHERS, PENDING, DRAFT,
	DECLINED, EXPIRED, VOIDED;

	public static List<EnvelopeStatus> activeStatuses() {
		return List.of(CREATED, IN_PROGRESS, NEED_TO_SIGN, EXPIRING_SOON, WAITING_FOR_OTHERS, PENDING);
	}

	public static boolean idVoidProhibitedFrom(EnvelopeStatus envelopeStatus) {
		return List.of(COMPLETED, CANCELED).contains(envelopeStatus);
	}

}
