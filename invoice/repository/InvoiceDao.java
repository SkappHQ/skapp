package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.type.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceDao extends JpaRepository<Invoice, Long>, InvoiceRepository {

	Long countByStatus(InvoiceStatus status);

}
