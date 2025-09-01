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
	INVOICE_ERROR_VALIDATION_CURRENCY_TYPE_INVALID("validation.invoice.customer.currency.type.invalid"),
	INVOICE_ERROR_VALIDATION_CUSTOMER_PROJECT_MAPPING_INVALID("validation.invoice.project.customer.already-exists"),
	INVOICE_ERROR_VALIDATION_CUSTOMER_EMAIL_ALREADY_EXISTS("validation.invoice.customer.email.already-exists");

	private final String messageKey;

}
