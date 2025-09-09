package com.skapp.enterprise.invoice.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceKPIResponseDto {

	private Long dueInvoices;

	private Long overdueInvoices;

}
