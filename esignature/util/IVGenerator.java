package com.skapp.enterprise.esignature.util;

import java.security.SecureRandom;

public class IVGenerator {

	private static final int IV_LENGTH = 16;

	private static final SecureRandom SECURE_RANDOM = new SecureRandom();// static to
																			// reuse the
																			// instance
																			// for better
																			// performance

	// Without the static field, each call to generateIV() would potentially create a new
	// SecureRandom instance,
	// which would be much less efficient, especially in high-throughput scenarios where
	// the method is called frequently.
	private IVGenerator() {
	}

	public static byte[] generateIV() {
		byte[] iv = new byte[IV_LENGTH];
		SECURE_RANDOM.nextBytes(iv);
		return iv;
	}

}