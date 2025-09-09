package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.CustomerContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerContactDao extends JpaRepository<CustomerContact, Long> {

	boolean existsByEmail(String email);

	Optional<CustomerContact> findByIdAndIsActive(Long id, boolean isActive);

	boolean existsByEmailAndIdNot(String email, Long id);

}
