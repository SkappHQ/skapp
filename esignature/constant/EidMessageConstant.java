package com.skapp.enterprise.esignature.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Message constants for eID verification module.
 */
@Getter
@RequiredArgsConstructor
public enum EidMessageConstant implements MessageConstant {

	// Provider errors
	EID_ERROR_PROVIDER_NOT_FOUND("ep.esign.eid.error.provider.not-found"),
	EID_ERROR_PROVIDER_NOT_ENABLED("ep.esign.eid.error.provider.not-enabled"),
	EID_ERROR_PROVIDER_UNAVAILABLE("ep.esign.eid.error.provider.unavailable"),

	// Session errors
	EID_ERROR_SESSION_NOT_FOUND("ep.esign.eid.error.session.not-found"),
	EID_ERROR_SESSION_NOT_ACTIVE("ep.esign.eid.error.session.not-active"),
	EID_ERROR_SESSION_ALREADY_ACTIVE("ep.esign.eid.error.session.already-active"),
	EID_ERROR_SESSION_EXPIRED("ep.esign.eid.error.session.expired"),

	// Verification errors
	EID_ERROR_VERIFICATION_FAILED("ep.esign.eid.error.verification.failed"),
	EID_ERROR_VERIFICATION_CANCELLED("ep.esign.eid.error.verification.cancelled"),
	EID_ERROR_VERIFICATION_TIMEOUT("ep.esign.eid.error.verification.timeout"),

	// Validation errors
	EID_VALIDATION_RECIPIENT_NOT_FOUND("ep.esign.eid.validation.recipient.not-found"),
	EID_VALIDATION_DOCUMENT_NOT_FOUND("ep.esign.eid.validation.document.not-found");

	private final String messageKey;

}
