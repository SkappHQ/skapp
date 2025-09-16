package com.skapp.enterprise.invoice.payload.response.invoice;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceTaxResponseDto {

	private Long id;

	private String taxName;

	private Double taxPercentage;

	private Double taxAmount;

}
