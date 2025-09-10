package com.skapp.enterprise.invoice.payload.request.invoice;

import com.skapp.enterprise.invoice.type.CurrencyType;
import com.skapp.enterprise.invoice.type.DiscountType;
import com.skapp.enterprise.invoice.type.InvoiceStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CreateInvoiceRequestDto {

	private Long customerId;

	private String invoiceId;

	private Long projectId;

	private LocalDateTime invoiceDate;

	private LocalDateTime dueDate;

	private String billedTo;

	private String payTo;

	private CurrencyType currency;

	private InvoiceStatus status;

	private Double subTotalAmount;

	private Double payableTotalAmount;

	private DiscountType discountType;

	private Double discountValue;

	private String invoiceTerms;

	private String invoiceNotes;

	private List<CreateInvoiceItemDto> invoiceItems;

	private List<CreateInvoiceExpenseDto> invoiceExpenses;

	private List<CreateInvoiceTaxDto> invoiceTaxes;

}
