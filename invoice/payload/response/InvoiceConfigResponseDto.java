package com.skapp.enterprise.invoice.payload.response;

import com.skapp.enterprise.invoice.type.CurrencyType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvoiceConfigResponseDto {

	private Long id;

	private String invoiceLogo;

	private CurrencyType currency;

	private String country;

	private String paymentTerms;

	private String payToAddress;

}
