package com.skapp.community.common.util;

import com.skapp.community.common.constant.ValidationConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import lombok.experimental.UtilityClass;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

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

	public static String convertToCommaSeperatedString(Set<String> values) {
		if (values == null || values.isEmpty()) {
			return null;
		}
		return values.stream().filter(Objects::nonNull).collect(Collectors.joining(EpCommonConstants.COMMA_DELIMITER));
	}

	public static Set<String> convertToList(String value) {
		if (value == null || value.isBlank()) {
			return new LinkedHashSet<>();
		}
		return Arrays.stream(value.split(EpCommonConstants.COMMA_DELIMITER))
			.map(String::trim)
			.filter(s -> !s.isEmpty())
			.collect(Collectors.toCollection(LinkedHashSet::new));
	}

}
