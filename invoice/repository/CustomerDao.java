package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerDao extends JpaRepository<Customer, Long>, CustomerRepository {

	boolean existsByEmail(String email);

}
