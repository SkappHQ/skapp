package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.peopleplanner.util.Validations;
import com.skapp.enterprise.invoice.constant.InvoiceCommonConstant;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.model.CustomerContact;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerBillingDetailsDto;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerContactDetailsDto;
import com.skapp.enterprise.invoice.repository.CustomerContactDao;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.service.CustomerValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerValidationServiceImpl implements CustomerValidationService {

	private final CustomerDao customerDao;

	private final CustomerContactDao customerContactDao;

	@Override
	public void validateCustomerName(String customerName) {

		if (customerName == null || customerName.trim().isEmpty()) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NAME_REQUIRED);
		}

		if (customerName.length() > InvoiceCommonConstant.CUSTOMER_NAME_LENGTH) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NAME_MAX_LENGTH_EXCEEDED);
		}

	}

	@Override
	public void validateCustomerBillingDetails(CustomerBillingDetailsDto customerBillingDetails) {

		if (customerBillingDetails.getEmail() != null) {
			Validations.validateEmail(customerBillingDetails.getEmail());

			if (customerDao.existsByEmail(customerBillingDetails.getEmail())) {
				throw new ValidationException(
						InvoiceMessageConstant.INVOICE_ERROR_VALIDATION_CUSTOMER_EMAIL_ALREADY_EXISTS);
			}
		}

	}

	@Override
	public void validateCustomerContactRequiredFields(CustomerContactDetailsDto customerContactDetailsDto,
			CustomerContact customerContact) {

		if ((customerContact == null || customerContact.getName() == null)
				&& (customerContactDetailsDto.getContactName() == null
						|| customerContactDetailsDto.getContactName().trim().isEmpty())) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_CONTACT_NAME_REQUIRED);
		}

		if (customerContactDetailsDto.getContactName() != null
				&& customerContactDetailsDto.getContactName().length() > InvoiceCommonConstant.CUSTOMER_NAME_LENGTH) {
			throw new ValidationException(
					InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_CONTACT_NAME_MAX_LENGTH_EXCEEDED);
		}

		if ((customerContact == null || customerContact.getEmail() == null)
				&& (customerContactDetailsDto.getEmail() == null
						|| customerContactDetailsDto.getEmail().trim().isEmpty())) {
			throw new ValidationException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_CONTACT_EMAIL_REQUIRED);
		}

	}

	@Override
	public void validateCustomerContactDetails(CustomerContactDetailsDto customerContactDetailsDto,
			CustomerContact customerContact) {

		Validations.validateEmail(customerContactDetailsDto.getEmail());

		boolean emailExists;

		if (customerContact != null && customerContact.getId() != null) {
			emailExists = customerContactDao.existsByEmailAndIdNot(customerContactDetailsDto.getEmail(),
					customerContact.getId());
		}
		else {

			emailExists = customerContactDao.existsByEmailAndIsActive(customerContactDetailsDto.getEmail(), true);
		}

		if (emailExists) {
			throw new ValidationException(
					InvoiceMessageConstant.INVOICE_ERROR_VALIDATION_CUSTOMER_CONTACT_EMAIL_ALREADY_EXISTS);
		}

		if ((customerContact == null || customerContact.getContactNo() == null)
				&& customerContactDetailsDto.getContactNo() != null
				&& !customerContactDetailsDto.getContactNo().isEmpty()) {
			Validations.validateContactNo(customerContactDetailsDto.getContactNo());
		}

	}

}
