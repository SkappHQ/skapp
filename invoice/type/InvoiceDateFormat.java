package com.skapp.enterprise.invoice.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum InvoiceDateFormat {

	YYYY_MM_DD("YYYY-MM-DD"), DD_MM_YYYY("DD/MM/YYYY"), YY_MM_DD("YY/MM/DD"), DD_MONTH_YYYY("DD Month YYYY");

	private final String value;

}
