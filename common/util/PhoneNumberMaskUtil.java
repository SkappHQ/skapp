package com.skapp.enterprise.common.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class PhoneNumberMaskUtil {

	/**
	 * Masks a phone number by hiding digits between the country code and the last three
	 * digits.
	 * <p>
	 * The method performs the following operations:
	 * <ul>
	 * <li>Removes all spaces from the input</li>
	 * <li>Adds a '+' prefix if not present</li>
	 * <li>Detects the country code (1-3 digits after '+')</li>
	 * <li>Preserves the country code and last 3 digits</li>
	 * <li>Masks all digits between country code and last 3 digits with asterisks</li>
	 * </ul>
	 * @param phoneNumber the phone number to mask (e.g., "94 777777777", "+1 212 555
	 * 0199")
	 * @return the masked phone number in format "{countryCode} *****{lastThreeDigits}"
	 * (e.g., "+94 ********208", "+1 **********199"), or null if input is null/empty
	 */
	public static String mask(String phoneNumber) {

		if (phoneNumber == null || phoneNumber.isEmpty()) {
			return null;
		}

		String trimmed = phoneNumber.trim();
		// Remove all spaces for consistent processing
		String cleaned = trimmed.replaceAll("\\s+", "");

		if (cleaned.isEmpty()) {
			return null;
		}

		// Add + prefix if missing
		if (!cleaned.startsWith("+")) {
			cleaned = "+" + cleaned;
		}

		int countryCodeEnd = findCountryCodeEnd(cleaned);
		if (countryCodeEnd == -1 || cleaned.length() <= countryCodeEnd + 3) {
			return cleaned;
		}

		String countryCode = cleaned.substring(0, countryCodeEnd);
		String lastThreeDigits = cleaned.substring(cleaned.length() - 3);
		int maskLength = cleaned.length() - countryCodeEnd - 3;

		return countryCode + " " + "*".repeat(maskLength) + lastThreeDigits;
	}

	/**
	 * Finds the end index of the country code in a phone number.
	 * <p>
	 * The method assumes country codes are 1-3 digits after the '+' prefix and uses the
	 * following logic:
	 * <ul>
	 * <li>Scans characters starting from index 1 (after '+')</li>
	 * <li>Returns the index of the first non-digit character found</li>
	 * <li>If all characters are digits, returns the minimum of 3 or the phone number
	 * length</li>
	 * </ul>
	 * @param phoneNumber the phone number starting with '+' (e.g., "+94777777777",
	 * "+1234567890")
	 * @return the end index of the country code (e.g., 3 for "+94", 2 for "+1")
	 */
	private static int findCountryCodeEnd(String phoneNumber) {
		for (int i = 1; i <= Math.min(4, phoneNumber.length()); i++) {
			if (i < phoneNumber.length() && !Character.isDigit(phoneNumber.charAt(i))) {
				return i;
			}
		}
		return Math.min(3, phoneNumber.length());
	}

}
