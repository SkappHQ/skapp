package com.skapp.enterprise.esignature.constant;

public class EsignConstants {

	public static final int ALLOWED_MAX_CHARACTER_ENVELOPE_DECLINE = 500;

	public static final int ALLOWED_MAX_CHARACTER_ENVELOPE_VOID = 200;

	/**
	 * Regex pattern that allows specific characters in input strings.
	 *
	 * Allowed characters include: - Letters from all languages (Unicode category \p{L}) -
	 * Combining diacritical marks (Unicode category \p{M}) - Latin-1 Supplement
	 * characters: - À-Ö, Ø-ö, ø-ÿ (\u00C0–\u00D6, \u00D8–\u00F6, \u00F8–\u00FF) - Latin
	 * Extended-A characters (\u0100–\u017F) - Specific additional characters: - ł
	 * (\u0142) - Macron ¯ (\u00AF) - Apostrophe ' (\u0027) - Hyphen-minus - (\u002D) -
	 * Caret ^ (\u005E) - Backtick ` (\u0060) - Tilde ~ (\u007E) - ç (\u00E7) and Ç
	 * (\u00C7) - Ring above ˚ (\u02DA) - Ø and ø (\u00D8, \u00F8)
	 *
	 */

	public static final String ALLOWED_CHARACTERS_REGEX_ENVELOPE_DECLINE_AND_VOID =
			// Regex to allow specific Unicode characters, including letters, marks,
			// spaces, and
			// special symbols
			"[\\p{L}\\p{M}\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u00FF"
					+ "\\u0100-\\u017F\\u0142\\u00AF\\u0027\\u002D\\u005E\\u0060\\u007E\\u00E7\\u00C7\\u02DA\\u00D8\\u00F8\\u0020]*";

	public static final int ESIGN_MAX_NAME_LENGTH_EXTERNAL_USER = 100;

}
