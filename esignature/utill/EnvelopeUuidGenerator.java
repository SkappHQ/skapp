package com.skapp.enterprise.esignature.utill;

import java.util.UUID;

public class EnvelopeUuidGenerator {

	private static final String ALLOWED_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	private static final int SECTION_LENGTH = 5;

	private static final int NUM_SECTIONS = 4;

	private static final String DIVIDER = "-";

	private EnvelopeUuidGenerator() {
	}

	/**
	 * Generates a globally unique envelope ID in the format: XXXXX-XXXXX-XXXXX-XXXXX
	 * where X is a random capital letter or number.
	 * @return A unique envelope ID string
	 */
	public static String generateUniqueEnvelopeId() {
		// Use UUID as the base for uniqueness
		UUID uuid = UUID.randomUUID();

		// Convert UUID to a string of allowed characters
		StringBuilder idBuilder = new StringBuilder();
		String uuidStr = uuid.toString().replace("-", "");

		// Generate ID with required length
		for (int i = 0; i < SECTION_LENGTH * NUM_SECTIONS; i++) {
			// Use each 2 hex characters from UUID to select a character from allowed set
			int hexPos = i * 2 % uuidStr.length();
			String hexValue = uuidStr.substring(hexPos, Math.min(hexPos + 2, uuidStr.length()));

			// Convert hex value to integer and map to our allowed character set
			int index = Integer.parseInt(hexValue, 16) % ALLOWED_CHARS.length();
			idBuilder.append(ALLOWED_CHARS.charAt(index));
		}

		// Format with dividers
		StringBuilder formattedId = new StringBuilder();
		for (int i = 0; i < NUM_SECTIONS; i++) {
			int startPos = i * SECTION_LENGTH;
			formattedId.append(idBuilder.substring(startPos, startPos + SECTION_LENGTH));

			// Add divider except after last section
			if (i < NUM_SECTIONS - 1) {
				formattedId.append(DIVIDER);
			}
		}

		return formattedId.toString();
	}

}
