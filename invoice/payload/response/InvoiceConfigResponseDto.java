package com.skapp.enterprise.invoice.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvoiceConfigResponseDto {

	private String logoUrl;

	private String currency;

	private String country;

	private String paymentTerms;

	private String payToAddress;

}
