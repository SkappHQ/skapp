package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.CustomerCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerFilterDto;

public interface CustomerService {

	ResponseEntityDto createCustomer(CustomerCreateRequestDto customerCreateRequestDto);

	ResponseEntityDto getAllCustomers(CustomerFilterDto customerFilterDto);

}
