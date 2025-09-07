package com.skapp.enterprise.invoice.payload.request;

import com.skapp.enterprise.invoice.type.InvoiceStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class InvoiceFilterRequestDto {

	// Date range filters
	private LocalDateTime invoiceDateFrom;

	private LocalDateTime invoiceDateTo;

	private LocalDateTime dueDateFrom;

	private LocalDateTime dueDateTo;

	// Entity filters
	private Long customerId;

	private Long projectId;

	private InvoiceStatus status;

	// Pagination parameters
	private int page = 0;

	private int size = 20;

	private String sortBy = "id";

	private String sortDirection = "DESC";

}
