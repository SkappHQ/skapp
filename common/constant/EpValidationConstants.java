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
	 * Regular expression pattern to validate IPv4 addresses. An IPv4 address consists of
	 * four decimal numbers (0-255) separated by dots. Example of a valid IPv4 address:
	 * 192.168.0.1
	 */
	public static final String IPV4_VALIDATION_PATTERN = "^((25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$";

	/**
	 * Regular expression pattern to validate IPv6 addresses. An IPv6 address consists of
	 * eight groups of four hexadecimal digits separated by colons. Example of a valid
	 * IPv6 address: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
	 */
	public static final String IPV6_VALIDATION_PATTERN = "^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$";

	/**
	 * Regular expression pattern to validate hexadecimal numbers. A hexadecimal number
	 * consists of digits (0-9) and letters (A-F or a-f). Example of a valid hexadecimal
	 * number: 1A3F
	 */
	public static final String VALID_COMPANY_PHONE_NUMBER_PATTERN = "^.{7,15}$";

}
