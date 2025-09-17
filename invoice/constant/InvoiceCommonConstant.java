package com.skapp.enterprise.invoice.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class InvoiceCommonConstant {

	public static final int CUSTOMER_NAME_LENGTH = 255;

	public static final String INVOICE_START_ID_FORMAT = "INV-%d-001";

	public static final String INVOICE_STANDARD_ID_REGEX = "INV-(\\d{4})-(\\d+)";

	public static final String INVOICE_NUMBER_SUFFIX = "-001";

	public static final String DATA = "data";

	public static final String INTERNAL_PROJECTS = "internalProjects";

	public static final int SUCCESS_STATUS_CODE = 200;

	public static final String ACTIVE = "ACTIVE";

	public static final String DEFAULT_ERROR_MESSAGE = "An error occurred while fetching projects.";

}
