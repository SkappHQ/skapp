package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.CustomerCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerFilterDto;
import com.skapp.enterprise.invoice.payload.request.CustomerStatusUpdateRequestDto;
import com.skapp.enterprise.invoice.payload.request.customer.CheckEmailRequestDto;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerContactDetailsDto;

public interface CustomerService {

	ResponseEntityDto createCustomer(CustomerCreateRequestDto customerCreateRequestDto);

	ResponseEntityDto getAllCustomers(CustomerFilterDto customerFilterDto);

	ResponseEntityDto getCustomerById(Long id);

	ResponseEntityDto updateCustomer(Long id, CustomerCreateRequestDto customerCreateRequestDto);

	ResponseEntityDto updateCustomerStatus(Long id, CustomerStatusUpdateRequestDto customerStatusUpdateRequestDto);

	ResponseEntityDto createCustomerContact(CustomerContactDetailsDto customerContactDetailsDto);

	ResponseEntityDto updateCustomerContact(Long id, CustomerContactDetailsDto customerContactDetailsDto);

	ResponseEntityDto deleteCustomerContact(Long id);

	ResponseEntityDto checkCustomerContactEmail(CheckEmailRequestDto checkEmailRequestDto);

}
