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

	/**
	 * Trims the provided string, treating null as an empty string.
	 * @param value the string to trim
	 * @return the trimmed string, never null
	 */
	public static String trimToEmpty(String value) {
		return value == null ? "" : value.trim();
	}

	/**
	 * Normalises a human name so it can be matched against a name stored in the database.
	 * Internal whitespace runs are collapsed, diacritics are stripped and the result is
	 * lowercased with {@link Locale#ROOT}. The same normalisation must be applied to both
	 * sides of a comparison; it is intentionally at least as lenient as the database
	 * collation so an in-memory re-match can never be stricter than the SQL predicate
	 * that produced the candidates.
	 * @param value the name to normalise
	 * @return the normalised name, never null
	 */
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
