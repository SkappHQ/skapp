package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface InvoiceRepository {

	Page<Invoice> findInvoicesWithFilters(InvoiceFilterRequestDto invoiceFilterRequestDto, Pageable pageable);

	long countByCreatedDateBetween(LocalDateTime start, LocalDateTime end);

}
