package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.type.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface InvoiceRepository {

	Page<Invoice> findInvoicesWithFilters(String invoiceId, LocalDateTime invoiceDateFrom, LocalDateTime invoiceDateTo,
			LocalDateTime dueDateFrom, LocalDateTime dueDateTo, Long customerId, Long projectId, InvoiceStatus status,
			Pageable pageable);

	long countByCreatedDateBetween(LocalDateTime start, LocalDateTime end);

}
