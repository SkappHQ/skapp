package com.skapp.enterprise.esignature.signature;

/**
 * Exception thrown when certificate provider operations fail.
 *
 * This includes failures in: - Certificate loading and parsing - Certificate chain
 * retrieval - Certificate validation operations - Metadata extraction
 */
public class CertificateProviderException extends Exception {

	private static final long serialVersionUID = 1L;

	public CertificateProviderException(String message) {
		super(message);
	}

	public CertificateProviderException(String message, Throwable cause) {
		super(message, cause);
	}

	public CertificateProviderException(Throwable cause) {
		super(cause);
	}

}
