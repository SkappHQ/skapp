package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.CustomerCreateRequestDto;

public interface CustomerService {

	ResponseEntityDto createCustomer(CustomerCreateRequestDto customerCreateRequestDto);

}
