package com.skapp.enterprise.common.constant;

import java.util.Set;

public class EpValidationConstants {

	private EpValidationConstants() {
		throw new UnsupportedOperationException("Utility class");
	}

	public static final String VALID_COMPANY_DOMAIN_NAME_REGEXP = "^[a-z]+(-[a-z]+)*$";

	public static final Set<String> RESTRICTED_SUBDOMAINS = Set.of("skapp", "skapp-dev", "skapp-qa", "skapp-stage",
			"skapp-prod", "skapp-test", "admin", "api", "mail", "smtp", "pop", "ftp", "www", "hello", "no-reply");


	public static final int ALLOWED_MAX_CHARACTERD_DECLINE = 500;

	public static final int ALLOWED_MAX_CHARACTERD_VOID= 200;

	public static final String ALLOWED_CHARACTERS_REGEX = "[\\p{L}\\p{M}\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u00FF"
				+ "\\u0100-\\u017F\\u0142\\u00AF\\u0027\\u002D\\u005E\\u0060\\u007E\\u00E7\\u00C7\\u02DA\\u00D8\\u00F8]*";



}
