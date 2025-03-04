package com.skapp.enterprise.esignature.utill;

import java.security.SecureRandom;

public class IVGenerator {

	private static final int IV_LENGTH = 16; // 128-bit authentication tag

	private IVGenerator() {
	}

	public static byte[] generateIV() {
		byte[] iv = new byte[IV_LENGTH];
		new SecureRandom().nextBytes(iv);
		return iv;
	}

}
