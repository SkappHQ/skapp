package com.skapp.enterprise.invoice.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceListResponseDto {

	private List<InvoiceResponseDto> invoices;

	private Long totalElements;

	private Integer totalPages;

	private Integer currentPage;

	private Integer pageSize;

	private Boolean hasNext;

	private Boolean hasPrevious;

}
