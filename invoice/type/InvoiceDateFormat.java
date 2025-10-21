package com.skapp.enterprise.invoice.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum InvoiceDateFormat {

	YYYY_MM_DD("yyyy-MM-dd"), DD_MM_YYYY("dd/MM/yyyy"), YY_MM_DD("yy/MM/dd"), DD_MONTH_YYYY("dd MMMM yyyy"),
	MONTH_DD_YYYY("MMMM dd, yyyy");

	private final String value;

}
