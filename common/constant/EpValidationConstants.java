package com.skapp.enterprise.common.constant;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class EpValidationConstants {

	public static final String VALID_COMPANY_DOMAIN_NAME_REGEXP = "^[a-z][a-z-]*[a-z]$";

	public static final Set<String> RESTRICTED_SUBDOMAINS = new HashSet<>(
			Arrays.asList("skapp", "skapp-dev", "skapp-qa", "skapp-stage", "skapp-prod", "skapp-test", "admin", "api",
					"mail", "smtp", "pop", "ftp", "www", "hello", "no-reply"));

}
