package com.skapp.enterprise.esignature.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EsignMessageConstant implements MessageConstant {

	ESIGN_ERROR_EXTERNAL_USER_EXITS("ep.esign.error.external-user-exists"),
	ESIGN_ERROR_DOCUMENT_ALREADY_ASSIGNED("ep.esign.error.envelope.document.already.assigned"),
	ESIGN_ERROR_ENVELOPE_WITH_NO_DOCUMENT("ep.esign.error.envelope.document-list.empty"),
	ESIGN_ERROR_DOCUMENT_ID_NOT_FOUND("ep.esign.error.envelope.document-id.not-found"),
	ESIGN_ERROR_FIELD_DOCUMENT_ID_NOT_FOUND("ep.esign.error.envelope.field-document.not-found"),
	ESIGN_ERROR_VALIDATION_ENTER_ENVELOPE_EXPIRES_AT("ep.esign.error.envelope.validation.enter-envelope-expires-at"),
	ESIGN_ERROR_ENVELOPE_NOT_FOUND("ep.esign.error.envelope.id-not-found"),
	ESIGN_ERROR_ENVELOPE_INVALID_STATUS_UPDATE("ep.esign.error.envelope.invalid-status-update"),
	ESIGN_ERROR_VOID_PROHIBITED_FROM_CURRENT_STATUS("ep.esign.error.envelope.void-prohibited-from-status"),
	ESIGN_ERROR_ENVELOPE_ALREADY_VOIDED("ep.esign.error.envelope.already-voided"),
	ESIGN_ERROR_RECIPIENT_ID_NOT_FOUND("ep.esign.error.recipient.-id.not-found"),

	ESIGN_VALIDATION_ENVELOPE_STATUS_INVALID("validation.envelope.status.invalid"),
	ESIGN_VALIDATION_RECIPIENT_MEMBER_ROLE_STATUS_INVALID("validation.recipient.member.role.status.invalid"),
	ESIGN_VALIDATION_DOCUMENT_FIELD_TYPE_INVALID("validation.document.field.type.invalid"),
	ESIGN_VALIDATION_DOCUMENT_FIELD_STATUS_INVALID("validation.document.field.status.invalid"),
	ESIGN_VALIDATION_PHONE_NUMBER_INVALID("validation.phone.invalid"),
	ESIGN_VALIDATION_DOCUMENT_CONTENT_CHANGED("validation.document.content.changed"),
	ESIGN_VALIDATION_INPUT_STREAM_CANNOT_BE_NULL("validation.input-stream.null"),
	ESIGN_VALIDATION_FIELD_LIST_CANNOT_BE_EMPTY("validation.field-list.empty"),
	ESIGN_VALIDATION_FIELD_CANNOT_BE_NULL("validation.field.null"),
	ESIGN_VALIDATION_PAGE_NUMBER_MUST_BE_POSITIVE("validation.page-number.positive"),
	ESIGN_VALIDATION_FIELD_VALUE_CANNOT_BE_EMPTY("validation.field-value.empty"),
	ESIGN_VALIDATION_COORDINATES_MUST_BE_NOT_NEGATIVE("validation.co-ordinates.must.not-negative"),
	ESIGN_VALIDATION_PAGE_NUMBER_EXCEED_DOCUMENT_PAGE_NUMBER_COUNT(
			"validation.page-number.exceed.document.page.number.count"),

	ESIGN_ERROR_NO_RECIPIENT_FOUND("ep.esign.error.recipient.not-found"),
	ESIGN_ERROR_RECIPIENT_ENVELOPE_MISMATCH("ep.esign.error.envelope.recipient.not-found"),
	ESIGN_ERROR_NOT_VALID_RECIPIENT_FOR_ENVELOPE("ep.esign.error.envelope.recipient.invalid"),
	ESIGN_ERROR_NO_RECIPIENTS_FOR_ENVELOPE("ep.esign.error.envelope.recipient.recipients.not-found"),
	ESIGN_ERROR_NO_DOCUMENT_EMAIL_SENT_ENVELOPE("ep.esign.error.envelope.recipient.emails-sent-recipients.not-found"),
	ESIGN_ERROR_FAILED_TO_SIGN_DOCUMENT("ep.esign.error.failed.sign.document"),
	ESIGN_ERROR_FAILED_TO_LOAD_KEY_PAIR("ep.esign.error.failed.load.key-pair"),
	ESIGN_ERROR_FAILED_TO_PROCESS_CURRENT_DOCUMENT_VERSION("ep.esign.error.failed.process.current.document-version"),
	ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND("ep.esign.error.document-version.not.found"),
	ESIGN_ERROR_FAILED_TO_HASH_DOCUMENT("ep.esign.error.failed.hash.document"),
	ESIGN_ERROR_FAILED_TO_VERIFY_SIGNATURE("ep.esign.error.failed.verify.signature"),
	ESIGN_ERROR_FAILED_TO_CONVERT_PRIVATE_KEY("ep.esign.error.failed.convert.private-key"),
	ESIGN_ERROR_FAILED_TO_CONVERT_PUBLIC_KEY("ep.esign.error.failed.convert.public-key"),
	ESIGN_ERROR_MISSING_DOCUMENT_VERSION_ID("ep.esign.error.missing.document.version.id"),
	ESIGN_ERROR_MISSING_ADDRESS_BOOK_ID("ep.esign.error.missing.address.book.id"),
	ESIGN_ERROR_EMPTY_FIELD_SIGN_LIST("ep.esign.error.empty.field.sign.list"),
	ESIGN_ERROR_USER_KEY_PAIR_NOT_FOUND("ep.esign.error.user.key.pair.not-found"),
	ESIGN_ERROR_USER_KEY_GENERATE("ep.esign.error.user.key.generate"),
	ESIGN_ERROR_FAILED_TO_LOAD_IMAGE("ep.esign.error.failed.load.image"),
	ESIGN_ERROR_FAILED_TO_PROCESS_PDF_DOCUMENT("ep.esign.error.failed.process.pdf-document"),
	ESIGN_ERROR_FAILED_DOWNLOAD_FILE("ep.esign.error.failed.download.file"),
	ESIGN_ERROR_FAILED_TO_UPLOAD_FILE("ep.esign.error.failed.upload.file"),
	ESIGN_ERROR_FAILED_TO_CONVERT_FILE_TO_BYTE("ep.esign.error.failed.convert.file.to.byte"),
	ESIGN_ERROR_FAILED_PRIVATE_KEY_ENCRYPTION("ep.esign.error.failed.convert.file.private-key.encryption"),
	ESIGN_ERROR_FAILED_PRIVATE_KEY_DECRYPTION("ep.esign.error.failed.convert.file.private-key.decryption"),
	ESIGN_ERROR_AES_KEY_NOT_FOUND("ep.esign.error.ase-key.not-found"),
	ESIGN_ERROR_FAILED_GENERATE_CERTIFICATE("ep.esign.error.failed.generate.certificate"),
	ESIGN_ERROR_MERGE_TEXT_FILED("ep.esign.error.merge.text-field"),
	ESIGN_ERROR_MERGE_IMAGE_FILED("ep.esign.error.merge.image-field"),
	ESIGN_ERROR_CREATE_NEW_DOCUMENT_VERSION("ep.esign.error.create.new.document-version"),
	ESIGN_ERROR_ADDRESS_BOOK_ID_NOT_FOUND("ep.esign.error.addressbook-id.not-found"),
	ESIGN_ERROR_CONFIG_NOT_FOUND("ep.esign.error.config.not-found"),
	ESIGN_ERROR_RECIPIENT_NOT_FOUND("ep.esign.error.recipient.not-found"),
	ESIGN_ERROR_RECIPIENT_CURRENT_USER_NOT_MATCH("ep.esign.error.recipient.current-user.not.match"),
	ESIGN_ERROR_INVALID_SIGN_ORDER_RECIPIENT("ep.esign.error.invalid.sign-order.recipient"),
	ESIGN_ERROR_DOCUMENT_NOT_FOUND("ep.esign.error.document.not-found"),
	ESIGN_ERROR_FIELD_CONTENT_CHANGED("ep.esign.error.field.content.changed"),
	ESIGN_ERROR_ALL_FIELDS_NEED_SIGN("ep.esign.error.all.fields.need.sign"),
	ESIGN_ERROR_IMAGE_VERIFY_FAIL("ep.esign.error.image.verify.fail"),
	ESIGN_ERROR_FIELD_ID_NOT_FOUND("ep.esign.error.field-id.not-found"),
	ESIGN_ERROR_ENVELOPE_DOCUMENT_MISMATCH("ep.esign.error.envelope.document.mis-match"),
	ESIGN_ERROR_ENVELOPE_RECIPIENT_MISMATCH("ep.esign.error.envelope.recipient.mis-match"),
	ESIGN_ERROR_RECIPIENT_FIELD_MISMATCH("ep.esign.error.recipient.field.mis-match"),
	ESIGN_ERROR_INVALID_DOCUMENT_ID("ep.esign.error.invalid.document.id");

	private final String messageKey;

}
