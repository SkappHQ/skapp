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
	INVOICE_ERROR_VALIDATION_PAYMENT_TERMS_INVALID("invoice.error.validation.payment.terms.invalid"),;

	private final String messageKey;

}
