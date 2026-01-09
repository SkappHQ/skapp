package com.skapp.enterprise.esignature.constant;

import java.util.regex.Pattern;

public class EsignConstants {

	public static final int ALLOWED_MAX_CHARACTER_ENVELOPE_DECLINE = 500;

	public static final int ALLOWED_MAX_CHARACTER_ENVELOPE_VOID = 200;

	/**
	 * Regex pattern that allows specific characters in input strings.
	 *
	 * Allowed characters include: - Letters from all languages (Unicode category \p{L}) -
	 * Combining diacritical marks (Unicode category \p{M}) - Numbers (Unicode category
	 * \p{N}) - Latin-1 Supplement characters: - À-Ö, Ø-ö, ø-ÿ (\u00C0–\u00D6,
	 * \u00D8–\u00F6, \u00F8–\u00FF) - Latin Extended-A characters (\u0100–\u017F) -
	 * Specific additional characters: - ł (\u0142) - Macron ¯ (\u00AF) - Apostrophe '
	 * (\u0027) - Hyphen-minus - (\u002D) - Forward slash / (\u002F) - Caret ^ (\u005E) -
	 * Backtick ` (\u0060) - Tilde ~ (\u007E) - ç (\u00E7) and Ç (\u00C7) - Ring above ˚
	 * (\u02DA) - Ø and ø (\u00D8, \u00F8)
	 *
	 */

	public static final String ALLOWED_CHARACTERS_REGEX_ENVELOPE_DECLINE_AND_VOID =
			// Regex to allow specific Unicode characters, including letters, marks,
			// numbers, spaces, and special symbols
			"[\\p{L}\\p{M}\\p{N}\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u00FF"
					+ "\\u0100-\\u017F\\u0142\\u00AF\\u0027\\u002D\\u002F\\u005E\\u0060\\u007E\\u00E7\\u00C7\\u02DA\\u00D8\\u00F8\\u0020]*";

	public static final int ESIGN_MAX_NAME_LENGTH_EXTERNAL_USER = 100;

	public static final String DOCUMENT_ACCESS_EMAIL_LINK_STATE_PATTERN = "ES___---ES___---";

	/**
	 * Regex pattern for validating external contact names. Allowed characters include: -
	 * Letters from all languages (Unicode category \p{L}) - Combining diacritical marks
	 * (Unicode category \p{M}) - Apostrophe (') - Hyphen (-) - Forward slash (/) - Macron
	 * (¯, \u00AF) - Ring above (˚, \u02DA) - Ø (\u00D8) and ø (\u00F8) - Polish ł
	 * (\u0142) - Backtick (`, \u0060) - Caret (^, \u005E) - Tilde (~, \u007E) - ç
	 * (\u00E7) and Ç (\u00C7) - Diaeresis (¨, \u00A8) - Acute accent (´, \u00B4) - Space
	 * character
	 */
	public static final Pattern ALLOWED_CHARACTERS_REGEX_EXTERNAL_CONTACT_NAME = Pattern.compile(
			"^[\\p{L}\\p{M}'\\-\\/\\u00AF\\u02DA\\u00D8\\u00F8\\u0142\\u0060\\u005E\\u007E\\u00E7\\u00C7\\u00A8\\u00B4\\s]+$");

	public static final String DOCUMENT_HISTORY_PREFIX = "Document History - ";

	public static final String AUDIT_ACTION_CREATED_DOCUMENT = " created the document";

	public static final String AUDIT_ACTION_SENT_DOCUMENT = " sent the document";

	public static final String AUDIT_ACTION_VIEWED_DOCUMENT = " viewed the document";

	public static final String AUDIT_ACTION_SIGNED_DOCUMENT = " signed the document";

	public static final String AUDIT_ACTION_DOCUMENT_COMPLETED = "Document is completed";

	public static final String AUDIT_ACTION_DOCUMENT_VOIDED = "Document made void";

	public static final String AUDIT_ACTION_DECLINED_TO_SIGN = " declined to sign";

	public static final String AUDIT_ACTION_DOCUMENT_EXPIRED = "Document expired";

	public static final String AUDIT_ACTION_DOWNLOADED_DOCUMENT = " downloaded the document";

	public static final String AUDIT_ACTION_TRANSFERRED_OWNERSHIP = " transferred ownership to ";

	public static final String CURRENT_OWNER_METADATA_NAME = "currentOwner";

	public static final int DEFAULT_COUNT = 0;

	public static final int DEFAULT_INCREMENT_COUNT = 1;

	public static final int MAX_RETRY_LIMIT = 5;

	public static final int MIN_OTP_BACKOFF_SECONDS = 30;

	/**
	 * Default OTP lock time in seconds (1 hour) Limit the impact of repeated failed OTP
	 * attempts by temporarily blocking further tries, reducing the risk of brute-force
	 * attacks.
	 */
	public static final int OTP_DEFAULT_LOCK_TIME = 3600;

	public static final int MIN_VERIFICATION_BACKOFF_SECONDS = 3;

	public static final int OTP_EXPIRY_TIME_SECONDS = 300;

	/**
	 * 3600 - Level 0: 1 hour 7200 - Level 1: 2 hours 14400 - Level 2: 4 hours 28800 -
	 * Level 3: 8 hours 86400 - Level 4+: 24 hours
	 */
	public static final int[] PROGRESSIVE_LOCKOUT_TIMES = { 3600, 7200, 14400, 28800, 86400 };

	public static final int LOCKOUT_LEVEL_RESET_DAYS = 1; // Reset level after 24 hours

	public static final int MAX_OTP_GENERATION_PER_DAY = 10; // Hard limit per 24 hours

	/**
	 * 30 - Level 0: 5 minutes 900 - Level 1: 15 minutes 1800 - Level 2: 30 minutes 3600 -
	 * Level 3: 1 hour 86400 - Level 4+: 24 hours
	 */
	public static final int[] VERIFICATION_PROGRESSIVE_LOCKOUT_TIMES = { 30, 900, 1800, 3600, 86400 };

	public static final int VERIFICATION_LOCKOUT_LEVEL_RESET_DAYS = 1;

}
