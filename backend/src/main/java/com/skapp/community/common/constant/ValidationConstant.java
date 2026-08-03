package com.skapp.community.common.constant;

import lombok.experimental.UtilityClass;

import java.util.regex.Pattern;

@UtilityClass
public class ValidationConstant {

	public static final Pattern LIKE_WILDCARD_PATTERN = Pattern.compile("([\\\\%_])");

	/**
	 * Matches any run of whitespace, including the non-breaking space that spreadsheet
	 * exports frequently introduce, so it can be collapsed into a single space.
	 */
	public static final Pattern WHITESPACE_RUN_PATTERN = Pattern.compile("[\\s\\u00A0]+");

	/**
	 * Matches Unicode combining marks, used to strip the diacritics left behind by NFD
	 * normalisation.
	 */
	public static final Pattern COMBINING_MARK_PATTERN = Pattern.compile("\\p{M}+");

	/**
	 * This pattern validates the hexadecimal color code should consist of letters A-F and
	 * a-f and numbers 0-9 with length 6 to 8
	 */

	public static final String HEXA_DECIMAL_VALIDATION_PATTERN = "^#([A-Fa-f0-9]{6,8})$";

	public static final String TIME_ZONE_VALIDATION_PATTERN = "^[a-zA-Z]+/[a-zA-Z]+$";

	/**
	 * this regex is designed to match a sequence of one or more characters that consists
	 * of alphabets (both uppercase & lowercase), numbers (0-9), whitespaces and
	 * below-mentioned special characters dash (-), underscore(_), Ampersand(&), Forward
	 * slash (/), Pipe (|), Open & Close Bracket ( [ ] )
	 */
	public static final String JOB_FAMILY_NAME_TITLE_REGEX = "[a-zA-Z\\d\\s-_&/|\\[\\]]+";

}
