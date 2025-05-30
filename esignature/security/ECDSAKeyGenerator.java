package com.skapp.enterprise.esignature.security;

import com.skapp.enterprise.esignature.constant.EsignMessageConstant;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.security.spec.ECGenParameterSpec;

public class ECDSAKeyGenerator {

	private static final String CURVE_NAME = "secp384r1";

	private static final String PROVIDER = "BC";

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
			KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(ALGORITHM, PROVIDER);
			ECGenParameterSpec ecSpec = new ECGenParameterSpec(CURVE_NAME);
			SecureRandom secureRandom = new SecureRandom();
			keyPairGenerator.initialize(ecSpec, secureRandom);
			return keyPairGenerator.generateKeyPair();
		}
		catch (NoSuchProviderException e) {
			throw new NoSuchProviderException(
					EsignMessageConstant.ESIGN_FAILED_TO_GENERATE_KEY_PAIR + e.getMessage());
		}
		catch (Exception e) {
			throw new NoSuchAlgorithmException(
					EsignMessageConstant.ESIGN_FAILED_TO_GENERATE_KEY_PAIR + e.getMessage(), e);
		}
	}

}
