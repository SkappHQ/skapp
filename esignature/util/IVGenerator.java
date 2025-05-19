package com.skapp.enterprise.esignature.util;

import java.security.SecureRandom;

public class IVGenerator {

	private static final int IV_LENGTH = 12; // 12 bytes (96 bits) for AES-GCM

	private static final SecureRandom SECURE_RANDOM = new SecureRandom();// static to
																			// reuse the
																			// instance
																			// for better
																			// performance

	private IVGenerator() {
	}

	public static byte[] generateIV() {
		byte[] iv = new byte[IV_LENGTH];
		SECURE_RANDOM.nextBytes(iv);
		return iv;
	}

}