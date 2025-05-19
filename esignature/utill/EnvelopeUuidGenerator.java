package com.skapp.enterprise.esignature.utill;

import java.nio.ByteBuffer;
import java.security.SecureRandom;
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
		// Use SecureRandom instead of timestamp for better unpredictability
		SecureRandom secureRandom = new SecureRandom();
		byte[] randomBytes = new byte[16];
		secureRandom.nextBytes(randomBytes);

		UUID uuid = UUID.randomUUID();
		long mostSigBits = uuid.getMostSignificantBits();
		long leastSigBits = uuid.getLeastSignificantBits();

		// XOR with secure random bytes instead of timestamp
		long combinedBits1 = mostSigBits ^ ByteBuffer.wrap(randomBytes, 0, 8).getLong();
		long combinedBits2 = leastSigBits ^ ByteBuffer.wrap(randomBytes, 8, 8).getLong();

		StringBuilder result = new StringBuilder(TOTAL_ID_LENGTH + NUM_SECTIONS - 1);

		for (int i = 0; i < TOTAL_ID_LENGTH; i++) {
			if (i > 0 && i % SECTION_LENGTH == 0) {
				result.append(DIVIDER);
			}

			int index;
			if (i < TOTAL_ID_LENGTH / 2) {
				index = Math.abs((int) ((combinedBits1 >> (i * 3)) & 0x3F) % ALLOWED_CHARS.length);
			}
			else {
				index = Math
					.abs((int) ((combinedBits2 >> ((i - TOTAL_ID_LENGTH / 2) * 3)) & 0x3F) % ALLOWED_CHARS.length);
			}

			result.append(ALLOWED_CHARS[index]);
		}

		return result.toString();
	}

}
