package com.skapp.enterprise.invoice.payload.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceListResponseDto {

	private List<InvoiceResponseDto> invoices;

	private Long totalElements;

	private Integer totalPages;

	private Integer currentPage;

	private Integer pageSize;

	private Boolean hasNext;

	private Boolean hasPrevious;

	public InvoiceListResponseDto(List<InvoiceResponseDto> invoices, Long totalElements, Integer totalPages,
			Integer currentPage, Integer pageSize) {
		this.invoices = invoices;
		this.totalElements = totalElements;
		this.totalPages = totalPages;
		this.currentPage = currentPage;
		this.pageSize = pageSize;
		this.hasNext = currentPage < totalPages - 1;
		this.hasPrevious = currentPage > 0;
	}

}
