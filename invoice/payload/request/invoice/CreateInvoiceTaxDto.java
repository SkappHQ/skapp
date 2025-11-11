package com.skapp.enterprise.invoice.payload.request.invoice;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateInvoiceTaxDto {

	private String taxType;

	private Double taxPercentage;

	private Double taxAmount;

}
