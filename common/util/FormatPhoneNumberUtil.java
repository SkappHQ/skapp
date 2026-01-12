package com.skapp.enterprise.common.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class FormatPhoneNumberUtil {

	/**
	 * Formats a phone number to E.164 format.
	 * <p>
	 * E.164 format requires:
	 * <ul>
	 * <li>Starts with '+' prefix</li>
	 * <li>Contains only digits after the '+'</li>
	 * <li>Maximum length of 15 characters (including '+')</li>
	 * </ul>
	 * @param phoneNumber the phone number to format (e.g., "94 xxxxxxxx", "+1 xxx xxx
	 * xxx")
	 * @return the E.164 formatted phone number (e.g., "+94xxxxxxxx", "+1xxxxxxxxxx")
	 */
	public static String formatPhoneNumberToE164(String phoneNumber) {

		// Remove all spaces and non-digit characters except +
		String cleanedPhoneNumber = phoneNumber.replaceAll("[^+\\d]", "");

		// Add + prefix if missing
		if (!cleanedPhoneNumber.startsWith("+")) {
			cleanedPhoneNumber = "+" + cleanedPhoneNumber;
		}

		return cleanedPhoneNumber;
	}

}
