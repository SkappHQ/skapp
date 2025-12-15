package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.mapper.CustomerMapper;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.payload.response.InternalCustomerResponseDto;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.service.InternalCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InternalCustomerServiceImpl implements InternalCustomerService {

	private final CustomerDao customerDao;

	private final CustomerMapper customerMapper;

	@Override
	@Transactional(readOnly = true)
	public List<InternalCustomerResponseDto> findAllCustomers() {

		List<Customer> customers = customerDao.findAllActiveCustomers();

		if (customers.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMERS_NOT_FOUND);
		}

		return customerMapper.customerToInternalCustomerResponseDto(customers);
	}

}
