package com.skapp.enterprise.common.constant;

import java.util.Set;

public class EpValidationConstants {

	private EpValidationConstants() {
		throw new UnsupportedOperationException("Utility class");
	}

	public static final String VALID_COMPANY_DOMAIN_NAME_REGEXP = "^[a-z]+(-[a-z]+)*$";

	public static final Set<String> RESTRICTED_SUBDOMAINS = Set.of("skapp", "skapp-dev", "skapp-qa", "skapp-stage",
			"skapp-prod", "skapp-test", "admin", "api", "mail", "smtp", "pop", "ftp", "www", "hello", "no-reply");

}
