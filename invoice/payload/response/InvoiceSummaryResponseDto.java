package com.skapp.enterprise.invoice.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceSummaryResponseDto {

	private long totalInvoices;

	private long dueInvoices;

	private long overdueInvoices;

	private long paidInvoices;

	private long deletedInvoices;

}
