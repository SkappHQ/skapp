package com.skapp.enterprise.invoice.payload.request;

import com.skapp.enterprise.invoice.type.CurrencyType;
import com.skapp.enterprise.invoice.type.DiscountType;
import com.skapp.enterprise.invoice.type.InvoiceStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CreateInvoiceRequestDto {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private Long projectId;

    @NotNull(message = "Invoice date is required")
    private LocalDateTime invoiceDate;

    private LocalDateTime dueDate;

    private String billedTo;

    private String payTo;

    @NotNull(message = "Currency is required")
    private CurrencyType currency;

    @NotNull(message = "Status is required")
    private InvoiceStatus status;

    private Double totalAmount;

    private DiscountType discountType;

    private Double discountValue;

    private BigDecimal taxPercentage;

    private String invoiceTerms;

    private String invoiceNotes;

    @Valid
    @NotEmpty(message = "At least one invoice item is required")
    private List<CreateInvoiceItemDto> invoiceItems;

    @Valid
    private List<CreateInvoiceExpenseDto> invoiceExpenses;
}