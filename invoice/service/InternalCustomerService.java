package com.skapp.enterprise.invoice.service;

import com.skapp.enterprise.invoice.payload.response.InternalCustomerResponseDto;

import java.util.List;

public interface InternalCustomerService {

	List<InternalCustomerResponseDto> findAllCustomers();

}
