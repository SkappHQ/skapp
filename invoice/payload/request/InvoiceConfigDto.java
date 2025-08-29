package com.skapp.enterprise.invoice.payload.request;

import com.skapp.enterprise.invoice.type.CurrencyType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvoiceConfigDto {

	private String logoUrl;

	private CurrencyType currency;

	private String country;

	private String paymentTerms;

	private String payToAddress;

}
