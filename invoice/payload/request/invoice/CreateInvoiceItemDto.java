package com.skapp.enterprise.invoice.payload.request.invoice;

import com.skapp.enterprise.invoice.type.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class CreateInvoiceItemDto {

    @NotBlank(message = "Item name is required")
    private String itemName;

    private String description;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private Double unitPrice;

    private DiscountType discountType;

    private Double discountValue;

    private Double amount;
}