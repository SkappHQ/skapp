package com.skapp.enterprise.invoice.service;

import com.skapp.enterprise.invoice.payload.request.InvoiceConfigRequestDto;

public interface InvoiceConfigValidationService {

	void validateInvoiceConfigRequest(InvoiceConfigRequestDto invoiceConfigDto);

}
