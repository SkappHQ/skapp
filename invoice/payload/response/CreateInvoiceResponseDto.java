package com.skapp.enterprise.invoice.payload.response;

import com.skapp.enterprise.invoice.type.InvoiceStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class CreateInvoiceResponseDto {

	private Long id;

	private String invoiceId;

	private InvoiceStatus status;

	private Double subTotalAmount;

	private Double payableTotalAmount;

	private LocalDateTime createdDate;

}
