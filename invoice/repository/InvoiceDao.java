package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.type.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceDao extends JpaRepository<Invoice, Long>, InvoiceRepository {

	Long countByStatus(InvoiceStatus status);

	List<Invoice> findByInvoiceIdContaining(String id);

}
