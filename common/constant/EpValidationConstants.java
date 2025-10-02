package com.skapp.enterprise.common.constant;

import lombok.experimental.UtilityClass;

import java.util.Set;

@UtilityClass
public class EpValidationConstants {

	public static final String VALID_COMPANY_DOMAIN_NAME_REGEXP = "^[a-z0-9]+(-[a-z0-9]+)*$";

	public static final Set<String> RESTRICTED_SUBDOMAINS = Set.of("skapp", "skapp-dev", "skapp-qa", "skapp-stage",
			"skapp-prod", "skapp-test", "admin", "api", "mail", "smtp", "pop", "ftp", "www", "hello", "no-reply",
			"document", "docs", "migrations");

	/**
	 * Regular expression pattern to validate a valid company phone number. The phone
	 * number should consist of 7 to 15 digits with spaces.
	 */
	public static final String VALID_COMPANY_PHONE_NUMBER_PATTERN = "^[+]?[0-9 ]{7,25}$";

}
