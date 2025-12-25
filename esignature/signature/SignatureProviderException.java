package com.skapp.enterprise.esignature.signature;

/**
 * Exception thrown when signature provider operations fail.
 *
 * This includes failures in: - Cryptographic signing operations - Certificate chain
 * retrieval - Provider initialization - Authentication/authorization with cloud providers
 * - Network connectivity issues
 */
public class SignatureProviderException extends Exception {

	private static final long serialVersionUID = 1L;

	public SignatureProviderException(String message) {
		super(message);
	}

	public SignatureProviderException(String message, Throwable cause) {
		super(message, cause);
	}

	public SignatureProviderException(Throwable cause) {
		super(cause);
	}

}
