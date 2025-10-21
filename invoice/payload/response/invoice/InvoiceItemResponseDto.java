package com.skapp.enterprise.invoice.payload.response.invoice;

import com.skapp.enterprise.invoice.type.DiscountType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceItemResponseDto {

	private Long id;

	private String itemName;

	private String description;

	private Integer quantity;

	private String quantityType;

	private Double unitPrice;

	private DiscountType discountType;

	private Double discountValue;

	private Double amount;

}
