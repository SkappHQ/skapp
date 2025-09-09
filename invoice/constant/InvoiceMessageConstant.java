package com.skapp.enterprise.invoice.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum InvoiceMessageConstant implements MessageConstant {

	INVOICE_ERROR_CONFIG_NOT_FOUND("invoice.error.config.not.found"),
	INVOICE_ERROR_VALIDATION_LOGO_URL_INVALID("invoice.error.validation.logo.url.invalid"),
	INVOICE_ERROR_VALIDATION_REQUEST_NULL("invoice.error.validation.request.null"),
	INVOICE_ERROR_VALIDATION_PAYMENT_TERMS_INVALID("invoice.error.validation.payment.terms.invalid"),
	INVOICE_ERROR_VALIDATION_CUSTOMER_PROJECT_MAPPING_INVALID("validation.error.customer.project-already-exists"),
	INVOICE_ERROR_VALIDATION_CUSTOMER_EMAIL_ALREADY_EXISTS("validation.error.customer.email.already-exists"),
	INVOICE_ERROR_CUSTOMER_NAME_REQUIRED("validation.error.customer.customer-name-required"),
	INVOICE_ERROR_CUSTOMER_NAME_MAX_LENGTH_EXCEEDED("validation.error.customer.customer-name-max-length-exceeded"),
	INVOICE_ERROR_CUSTOMER_NOT_FOUND("ep.invoice.error.customer.not.found"),
	INVOICE_ERROR_CUSTOMER_CONTACT_NAME_REQUIRED("validation.error.customer.customer-contact-name-required"),
	INVOICE_ERROR_CUSTOMER_CONTACT_NAME_MAX_LENGTH_EXCEEDED(
			"validation.error.customer.customer-contact-name-max-length-exceeded"),
	INVOICE_ERROR_CUSTOMER_CONTACT_EMAIL_REQUIRED("validation.error.customer.customer-contact-email-required"),
	INVOICE_ERROR_VALIDATION_CUSTOMER_CONTACT_EMAIL_ALREADY_EXISTS(
			"validation.error.customer.customer-contact-email-already-exists"),
	INVOICE_ERROR_CUSTOMER_CONTACT_NOT_FOUND("ep.invoice.error.customer.contact.not.found"),
	INVOICE_SUCCESS_DELETE_CUSTOMER_CONTACT("api.success.invoice.delete-customer-contact"),;

	private final String messageKey;

}
