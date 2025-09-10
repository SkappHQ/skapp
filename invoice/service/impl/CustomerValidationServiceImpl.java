package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.peopleplanner.util.Validations;
import com.skapp.enterprise.invoice.constant.InvoiceCommonConstant;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerBillingDetailsDto;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.service.CustomerValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerValidationServiceImpl implements CustomerValidationService {

	private final CustomerDao customerDao;

	@Override
	public void validateCustomerName(String customerName) {

		if (customerName == null || customerName.trim().isEmpty()) {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NAME_REQUIRED);
		}

		if (customerName.length() > InvoiceCommonConstant.CUSTOMER_NAME_LENGTH) {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NAME_MAX_LENGTH_EXCEEDED);
		}

	}

	@Override
	public void validateCustomerBillingDetails(CustomerBillingDetailsDto customerBillingDetails) {

		if (customerBillingDetails.getEmail() != null) {
			Validations.validateEmail(customerBillingDetails.getEmail());

			if (customerDao.existsByEmail(customerBillingDetails.getEmail())) {
				throw new ModuleException(
						InvoiceMessageConstant.INVOICE_ERROR_VALIDATION_CUSTOMER_EMAIL_ALREADY_EXISTS);
			}
		}

	}

}
