package com.skapp.community.common.util;

import com.skapp.community.common.constant.ValidationConstant;
import lombok.experimental.UtilityClass;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@UtilityClass
public class StringUtils {

	private static final String COMMA_DELIMITER = ",";

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

	public static String normalizeName(String value) {
		if (isNullOrBlank(value)) {
			return "";
		}

		String collapsed = ValidationConstant.MULTIPLE_WHITESPACE_PATTERN.matcher(value.strip()).replaceAll(" ");
		String decomposed = Normalizer.normalize(collapsed, Normalizer.Form.NFD);
		return ValidationConstant.DIACRITIC_MARK_PATTERN.matcher(decomposed).replaceAll("").toLowerCase();
	}

	public static String convertToCommaSeperatedString(Set<String> values) {
		if (values == null || values.isEmpty()) {
			return null;
		}
		return values.stream().collect(Collectors.joining(COMMA_DELIMITER));
	}

	public static Set<String> convertToList(String value) {
		if (isNullOrBlank(value)) {
			return new LinkedHashSet<>();
		}
		return Arrays.stream(value.split(COMMA_DELIMITER)).collect(Collectors.toCollection(LinkedHashSet::new));
	}

}
