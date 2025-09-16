package com.skapp.enterprise.invoice.payload.response.invoice;

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
public class InvoiceDetailResponseDto {

	private Long id;

	private String invoiceId;

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

	private CustomerResponseDto customer;

	private List<InvoiceItemResponseDto> invoiceItems;

	private List<InvoiceExpenseResponseDto> invoiceExpenses;

	private List<InvoiceTaxResponseDto> invoiceTaxes;

	private LocalDateTime createdDate;

	private LocalDateTime modifiedDate;

	private String createdBy;

	private String modifiedBy;

}
