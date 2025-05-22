package com.skapp.enterprise.esignature.security;

import com.skapp.enterprise.esignature.constant.EsignMessageConstant;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.security.spec.ECGenParameterSpec;

public class ECDSAKeyGenerator {

	private static final String CURVE_NAME = "secp384r1"; // NIST P-384 curve Provides 192
															// bits of security (noted in
															// the method's documentation)

	// secp256r1 (P-256) - Offers 128 bits of security, good balance of security and
	// performance
	// secp521r1 (P-521) - Offers highest security level (256 bits) but slower operations

	private static final String PROVIDER = "BC"; // BouncyCastle provider

	private static final String ALGORITHM = "EC"; // Elliptic Curve algorithm

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
			// Get an instance of KeyPairGenerator for EC algorithm using BouncyCastle
			// provider
			KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(ALGORITHM, PROVIDER);

			// Create parameter specification for the chosen elliptic curve (NIST P-384)
			ECGenParameterSpec ecSpec = new ECGenParameterSpec(CURVE_NAME);

			// Create a cryptographically strong random number generator
			// SecureRandom automatically seeds itself from OS entropy sources
			SecureRandom secureRandom = new SecureRandom();

			// Initialize the key pair generator with the curve specification and secure
			// random source
			keyPairGenerator.initialize(ecSpec, secureRandom);

			// Generate and return the public/private key pair
			return keyPairGenerator.generateKeyPair();
		}
		catch (NoSuchProviderException e) {
			// Specific exception for when the BouncyCastle provider is not available
			// Wraps the original exception with custom error message
			throw new NoSuchProviderException(EsignMessageConstant.FAILED_TO_GENERATE_EC_KEY_PAIR + e.getMessage());
		}
		catch (Exception e) {
			// Catch all other exceptions (like InvalidAlgorithmParameterException)
			// Wraps in NoSuchAlgorithmException with custom error message and original
			// cause
			throw new NoSuchAlgorithmException(EsignMessageConstant.FAILED_TO_GENERATE_EC_KEY_PAIR + e.getMessage(), e);
		}
	}

}