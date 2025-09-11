package com.skapp.enterprise.invoice.service;

import com.skapp.enterprise.invoice.model.CustomerContact;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerBillingDetailsDto;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerContactDetailsDto;

public interface CustomerValidationService {

	void validateCustomerName(String customerName);

	void validateCustomerBillingDetails(CustomerBillingDetailsDto customerBillingDetails);

	void validateCustomerContactRequiredFields(CustomerContactDetailsDto customerContactDetailsDto,
			CustomerContact customerContact);

	void validateCustomerContactDetails(CustomerContactDetailsDto customerContactDetailsDto,
			CustomerContact customerContact);

}
