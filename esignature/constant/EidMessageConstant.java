package com.skapp.enterprise.esignature.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Message constants for eID verification.
 */
@Getter
@RequiredArgsConstructor
public enum EidMessageConstant implements MessageConstant {

	// Provider errors
	EID_ERROR_PROVIDER_NOT_FOUND("ep.eid.error.provider.not-found"),
	EID_ERROR_PROVIDER_NOT_ENABLED("ep.eid.error.provider.not-enabled"),

	// Session errors
	EID_ERROR_SESSION_NOT_FOUND("ep.eid.error.session.not-found"),
	EID_ERROR_SESSION_NOT_ACTIVE("ep.eid.error.session.not-activ"),
	EID_ERROR_SESSION_ALREADY_ACTIVE("ep.eid.error.session.already-active"),

	// Validation errors
	EID_VALIDATION_RECIPIENT_NOT_FOUND("ep.eid.validation.recipient.not-found"),
	EID_VALIDATION_DOCUMENT_NOT_FOUND("ep.eid.validation.document.not-found"),

	// Success messages
	EID_SUCCESS_VERIFICATION_CANCELLED("ep.eid.success.verification.cancelled");

	private final String messageKey;

}
