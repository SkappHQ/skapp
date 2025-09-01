package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.CustomerContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerContactDao extends JpaRepository<CustomerContact, Long> {

}
