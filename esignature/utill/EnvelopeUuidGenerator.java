package com.skapp.enterprise.esignature.utill;

import java.time.Instant;
import java.util.UUID;

public class EnvelopeUuidGenerator {

	private static final char[] ALLOWED_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".toCharArray();

	private static final int SECTION_LENGTH = 5;

	private static final int NUM_SECTIONS = 4;

	private static final int TOTAL_ID_LENGTH = SECTION_LENGTH * NUM_SECTIONS;

	private static final String DIVIDER = "-";

	private EnvelopeUuidGenerator() {
	}

	public static String generateUniqueEnvelopeId() {
		// Get current timestamp (milliseconds since epoch)
		long timestamp = Instant.now().toEpochMilli();

		// Use UUID as additional source of uniqueness
		UUID uuid = UUID.randomUUID();
		long mostSigBits = uuid.getMostSignificantBits();
		long leastSigBits = uuid.getLeastSignificantBits();

		// Combine timestamp with UUID bits for enhanced uniqueness
		long combinedBits1 = mostSigBits ^ (timestamp << 32);
		long combinedBits2 = leastSigBits ^ timestamp;

		// Pre-allocate the exact buffer size needed for the result
		StringBuilder result = new StringBuilder(TOTAL_ID_LENGTH + NUM_SECTIONS - 1);

		// Generate characters using combined bits
		for (int i = 0; i < TOTAL_ID_LENGTH; i++) {
			// Insert dividers at appropriate positions
			if (i > 0 && i % SECTION_LENGTH == 0) {
				result.append(DIVIDER);
			}

			// Use different parts of the combined bits to select characters
			int index;
			if (i < TOTAL_ID_LENGTH / 2) {
				// Use first combined value for first half
				index = (int) ((combinedBits1 >> (i * 3)) & 0x3F) % ALLOWED_CHARS.length;
			}
			else {
				// Use second combined value for second half
				index = (int) ((combinedBits2 >> ((i - TOTAL_ID_LENGTH / 2) * 3)) & 0x3F) % ALLOWED_CHARS.length;
			}

			result.append(ALLOWED_CHARS[index]);
		}

		return result.toString();
	}

}
