package com.skapp.enterprise.invoice.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum InvoiceMessageConstant implements MessageConstant {
    INVOICE_ERROR_CONFIG_NOT_FOUND("invoice.error.config.not.found");
    private final String messageKey;
}
