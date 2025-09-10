package com.skapp.enterprise.invoice.payload.response;

import com.skapp.enterprise.invoice.type.CurrencyType;
import com.skapp.enterprise.invoice.type.DiscountType;
import com.skapp.enterprise.invoice.type.InvoiceStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceResponseDto {

	private Long id;

	private String invoiceId;

	private Long customerId;

	private String customerName;

	private Long projectId;

	private LocalDateTime invoiceDate;

	private LocalDateTime dueDate;

	private String billedTo;

	private String payTo;

	private CurrencyType currency;

	private InvoiceStatus status;

	private DiscountType discountType;

	private Double discountValue;

	private String invoiceTerms;

	private String invoiceNotes;

	private Double subTotalAmount;

	private Double payableTotalAmount;

	private String invoiceLogo;

}
