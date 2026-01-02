package com.skapp.enterprise.common.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class EmailMaskUtil {

	/**
	 * Masks an email address showing only the first character and domain Example:
	 * yashoda@gmail.com -> y**********@gmail.com
	 * @param email the email address to mask
	 * @return masked email or null if input is null/empty/invalid
	 */
	public static String mask(String email) {
		if (email == null || email.isEmpty()) {
			return null;
		}

		String trimmed = email.trim();
		int atIndex = trimmed.indexOf('@');

		if (atIndex <= 0 || atIndex == trimmed.length() - 1) {
			return trimmed;
		}

		String localPart = trimmed.substring(0, atIndex);
		String domain = trimmed.substring(atIndex);

		if (localPart.length() == 1) {
			return localPart + domain;
		}

		String firstChar = localPart.substring(0, 1);
		int maskLength = localPart.length() - 1;

		return firstChar + "*".repeat(maskLength) + domain;
	}

}
