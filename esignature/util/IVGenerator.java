package com.skapp.enterprise.esignature.util;

import java.security.SecureRandom;

public class IVGenerator {

	private static final int IV_LENGTH = 16;

	private static final SecureRandom SECURE_RANDOM = new SecureRandom();


	private IVGenerator() {
	}

	public static byte[] generateIV() {
		byte[] iv = new byte[IV_LENGTH];
		SECURE_RANDOM.nextBytes(iv);
		return iv;
	}

}