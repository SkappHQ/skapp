package com.skapp.enterprise.invoice.payload.response.invoice;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceTaxResponseDto {

	private Long id;

	private String taxType;

	private Double taxPercentage;

	private Double taxAmount;

}
