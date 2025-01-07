package com.skapp.enterprise.esignature.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SignerMessageConstant implements MessageConstant {

	SIGNER_ERROR_DOCUMENT_ID_NOT_FOUND("api.error.signer.document-id.not-found"),
	SIGNER_ERROR_USER_ID_NOT_FOUND("api.error.signer.user-id.not-found"),
	SIGNER_ERROR_SIGNATURE_CREATION("api.error.signer.signature.creation"),
	SIGNER_ERROR_FAILED_TO_INITIALIZE_MESSAGE("api.error.fail.to.initialize.message"),
	SIGNER_ERROR_READING_HASH_FILE("api.error.reading.hash.file");

	private final String messageKey;

}
