package com.skapp.enterprise.invoice.service;

import com.skapp.enterprise.invoice.payload.request.customer.CustomerBillingDetailsDto;

public interface CustomerValidationService {

	void validateCustomerName(String customerName);

	void validateCustomerBillingDetails(CustomerBillingDetailsDto customerBillingDetails);

}
