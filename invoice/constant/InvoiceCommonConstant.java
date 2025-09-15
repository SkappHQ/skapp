package com.skapp.enterprise.invoice.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class InvoiceCommonConstant {

	public static final int CUSTOMER_NAME_LENGTH = 255;

	public static final String INVOICE_STANDARD_START_ID_FORMAT = "INV-%d-001";

	public static final String INVOICE_START_ID_TEMPLATE = "%s-%d-001";

	public static final String INVOICE_STANDARD_ID_REGEX = "([A-Z]+)-(\\d{4})-(\\d+)";

	public static final String INVOICE_NUMBER_SUFFIX = "-001";

}
