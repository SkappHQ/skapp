package com.skapp.enterprise.common.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class PhoneNumberMaskUtil {

	/**
	 * Masks a phone number showing only the country code and last digit Example:
	 * +94771234567 -> +94 *********7
	 * @param phoneNumber the phone number to mask
	 * @return masked phone number or null if input is null/empty
	 */
	public static String mask(String phoneNumber) {
		if (phoneNumber == null || phoneNumber.isEmpty()) {
			return null;
		}

		String trimmed = phoneNumber.trim();

		if (trimmed.startsWith("+")) {
			int countryCodeEnd = findCountryCodeEnd(trimmed);
			if (countryCodeEnd == -1 || trimmed.length() <= countryCodeEnd + 1) {
				return trimmed;
			}

			String countryCode = trimmed.substring(0, countryCodeEnd);
			String lastDigit = trimmed.substring(trimmed.length() - 1);
			int maskLength = trimmed.length() - countryCodeEnd - 1;

			return countryCode + " " + "*".repeat(maskLength) + lastDigit;
		}

		if (trimmed.length() <= 1) {
			return trimmed;
		}

		String lastDigit = trimmed.substring(trimmed.length() - 1);
		int maskLength = trimmed.length() - 1;

		return "*".repeat(maskLength) + lastDigit;
	}

	/**
	 * Finds the end index of the country code in a phone number Assumes country codes are
	 * 1-3 digits after the + sign
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