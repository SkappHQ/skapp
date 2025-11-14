package com.skapp.enterprise.common.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class EmailNameExtractor {

	/**
	 * Returns the exact string before '@' in the email. Examples:
	 * "hello_user@company.com" -> "hello_user" "john.doe@example.com" -> "john.doe"
	 */
	public static String extractName(String email) {
		if (email == null || !email.contains("@")) {
			return "";
		}

		return email.substring(0, email.indexOf("@"));
	}

}
