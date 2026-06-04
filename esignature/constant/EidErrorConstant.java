package com.skapp.enterprise.esignature.constant;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EidErrorConstant {

	OVERALL_SESSION_EXPIRED("Session has exceeded the maximum allowed duration."),
	ORDER_TRANSACTION_EXPIRED("The transaction has expired."), USER_CANCELLED_SIGNING("User cancelled the signing."),
	ORDER_CANCELLED("The order was cancelled."), SIGNING_FAILED_PREFIX("Signing failed: ");

	private final String message;

}
