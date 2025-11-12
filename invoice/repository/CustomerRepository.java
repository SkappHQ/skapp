package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.payload.request.CustomerFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository {

	Page<Customer> findAllCustomers(CustomerFilterDto customerFilterDto, Pageable page);

	List<Customer> findAllActiveCustomers();

}
