package com.skapp.enterprise.invoice.payload.request;

import com.skapp.enterprise.invoice.type.InvoiceStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class InvoiceFilterRequestDto {

	private String invoiceId;

	private LocalDateTime invoiceDateFrom;

	private LocalDateTime invoiceDateTo;

	private LocalDateTime dueDateFrom;

	private LocalDateTime dueDateTo;

	private Long customerId;

	private Long projectId;

	private InvoiceStatus status;

	private int page = 0;

	private int size = 10;

	private String sortBy = "id";

	private String sortDirection = "DESC";

	private String searchKeyword;

}
