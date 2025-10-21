package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

public interface InvoiceRepository {

	Page<Invoice> findInvoicesWithFilters(InvoiceFilterRequestDto invoiceFilterRequestDto, Pageable pageable);

	long countByCreatedDateBetween(LocalDateTime start, LocalDateTime end);

	LocalDate getLatestInvoiceDate(Long customerId, Long projectId);

	Optional<Invoice> findByIdWithAssociations(Long id);

}
