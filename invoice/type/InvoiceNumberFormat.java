package com.skapp.enterprise.invoice.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum InvoiceNumberFormat {

	US_UK("1,234.56 (US/UK)"), EUROPE("1.234,56 (Europe)"), SWISS("1'234,56 (Swiss)"),
	FRENCH_NORDIC("1 234,56 (French and Nordics)");

	private final String value;

}
