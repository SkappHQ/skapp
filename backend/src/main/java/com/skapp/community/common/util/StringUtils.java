package com.skapp.community.common.util;

import com.skapp.community.common.constant.ValidationConstant;
import lombok.experimental.UtilityClass;

import java.text.Normalizer;
import java.util.Locale;

@UtilityClass
public class StringUtils {

	/**
	 * Returns true if the provided string is either null or consists solely of whitespace
	 * characters. This method uses String.isBlank() to check for blank strings, which
	 * includes empty strings and strings with only whitespace.
	 * @param string the string to check
	 * @return true if the string is null or blank, false otherwise
	 */
	public static boolean isNullOrBlank(String string) {
		return string == null || string.isBlank();
	}

	public static String escapeLikePattern(String input) {
		return ValidationConstant.LIKE_WILDCARD_PATTERN.matcher(input).replaceAll("\\\\$1");
	}

	public static String trimToEmpty(String value) {
		return value == null ? "" : value.trim();
	}

	public static String normalizeName(String value) {
		String trimmed = trimToEmpty(value);
		if (trimmed.isEmpty()) {
			return trimmed;
		}

		String collapsed = ValidationConstant.WHITESPACE_RUN_PATTERN.matcher(trimmed).replaceAll(" ");
		String decomposed = Normalizer.normalize(collapsed, Normalizer.Form.NFD);
		return ValidationConstant.COMBINING_MARK_PATTERN.matcher(decomposed).replaceAll("").toLowerCase(Locale.ROOT);
	}

}
