package com.skapp.enterprise.invoice.service;

import com.skapp.enterprise.invoice.model.CustomerContact;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentFilterDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentRenameRequestDto;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerBillingDetailsDto;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerContactDetailsDto;

public interface CustomerValidationService {

	void validateCustomerName(String customerName);

	void validateCustomerBillingDetails(CustomerBillingDetailsDto customerBillingDetails);

	void validateCustomerContactRequiredFields(CustomerContactDetailsDto customerContactDetailsDto,
			CustomerContact customerContact);

	void validateCustomerContactDetails(CustomerContactDetailsDto customerContactDetailsDto,
			CustomerContact customerContact);

	void validateCustomerDocumentCreateRequestDto(CustomerDocumentCreateRequestDto requestDto);

	void validateCustomerDocumentFilterDto(CustomerDocumentFilterDto filterDto);

	void validateCustomerDocumentRenameRequestDto(Long customerId, Long documentId, String documentName);

}
