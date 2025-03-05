package com.skapp.enterprise.esignature.security;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;

public class ECDSAKeyGenerator {

	private ECDSAKeyGenerator() {
	}

	public static KeyPair generateKeyPair() throws NoSuchAlgorithmException, NoSuchProviderException {
		KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC", "BC");
		keyPairGenerator.initialize(256);
		return keyPairGenerator.generateKeyPair();
	}

}
