package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.peopleplanner.util.Validations;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.payload.request.InvoiceConfigRequestDto;
import com.skapp.enterprise.invoice.service.InvoiceConfigValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceConfigValidationServiceImpl implements InvoiceConfigValidationService {

	@Override
	public void validateInvoiceConfigRequest(InvoiceConfigRequestDto invoiceConfigDto) {
		if (invoiceConfigDto == null) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_VALIDATION_REQUEST_NULL);
		}

		if (invoiceConfigDto.getCountry() != null && !invoiceConfigDto.getCountry().trim().isEmpty()) {
			Validations.validateCountry(invoiceConfigDto.getCountry());
		}

		if (invoiceConfigDto.getPayToAddress() != null && !invoiceConfigDto.getPayToAddress().trim().isEmpty()) {
			Validations.validateAddress(invoiceConfigDto.getPayToAddress());
		}

	}

}
