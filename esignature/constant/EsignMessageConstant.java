package com.skapp.enterprise.esignature.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EsignMessageConstant implements MessageConstant {

	ESIGN_ERROR_EXTERNAL_USER_EXITS("ep.esign.error.external-user-exists"),
	ESIGN_ERROR_ENVELOPE_WITH_NO_DOCUMENT("ep.esign.error.envelope.document-list.empty"),
	ESIGN_ERROR_DOCUMENT_ID_NOT_FOUND("ep.esign.error.envelope.document-id.not-found"),
	ESIGN_ERROR_FIELD_DOCUMENT_ID_NOT_FOUND("ep.esign.error.envelope.field-document.not-found"),
	ESIGN_ERROR_VALIDATION_ENTER_ENVELOPE_EXPIRES_AT("ep.esign.error.envelope.validation.enter-envelope-expires-at"),
	ESIGN_ERROR_ENVELOPE_NOT_FOUND("ep.esign.error.envelope.id-not-found"),
	ESIGN_ERROR_ENVELOPE_INVALID_STATUS_UPDATE("ep.esign.error.envelope.invalid-status-update"),
	ESIGN_ERROR_VOID_PROHIBITED_FROM_CURRENT_STATUS("ep.esign.error.envelope.void-prohibited-from-status"),
	ESIGN_ERROR_ENVELOPE_ALREADY_VOIDED("ep.esign.error.envelope.already-voided"),
	ESIGN_ERROR_SIGNER_ID_NOT_FOUND("ep.esign.error.signer.signer-id.not-found"),;

	private final String messageKey;

}
