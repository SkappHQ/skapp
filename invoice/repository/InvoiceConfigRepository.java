package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.InvoiceConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceConfigRepository extends JpaRepository<InvoiceConfig, Long> {

	Optional<InvoiceConfig> findFirstBy();

}
