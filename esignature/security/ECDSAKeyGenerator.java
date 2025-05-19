package com.skapp.enterprise.esignature.security;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.security.spec.ECGenParameterSpec;

public class ECDSAKeyGenerator {

	private static final String CURVE_NAME = "secp384r1"; // NIST P-384 curve

	private static final String PROVIDER = "BC"; // BouncyCastle provider

	private ECDSAKeyGenerator() {
		// Private constructor to prevent instantiation
	}

	/**
	 * Generates an ECDSA key pair using the specified curve. Uses secp384r1 (NIST P-384)
	 * which provides 192 bits of security.
	 * @return a secure EC key pair
	 * @throws NoSuchAlgorithmException if the EC algorithm is not available
	 * @throws NoSuchProviderException if the BC provider is not available
	 */
	public static KeyPair generateKeyPair() throws NoSuchAlgorithmException, NoSuchProviderException {
		try {
			KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC", PROVIDER);
			ECGenParameterSpec ecSpec = new ECGenParameterSpec(CURVE_NAME);
			keyPairGenerator.initialize(ecSpec, new SecureRandom());
			return keyPairGenerator.generateKeyPair();
		}
		catch (Exception e) {
			throw new NoSuchAlgorithmException("Failed to generate EC key pair: " + e.getMessage(), e);
		}
	}

}