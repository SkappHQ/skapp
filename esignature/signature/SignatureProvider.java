package com.skapp.enterprise.esignature.signature;

import com.skapp.enterprise.esignature.model.SignatureProviderType;

import java.security.cert.X509Certificate;

/**
 * Interface for cryptographic signature operations.
 *
 * Implementations of this interface provide the actual signing mechanism, which can be
 * backed by: - Local PKCS#12 keystore (development) - Azure Key Vault Premium
 * (production) - AWS CloudHSM (production alternative) - Google Cloud HSM (production
 * alternative)
 *
 * The application layer should depend only on this interface, not on concrete
 * implementations, allowing seamless switching between providers.
 */
public interface SignatureProvider {

	/**
	 * Sign a hash using the configured private key.
	 *
	 * The private key used for signing is managed by the implementation and should never
	 * be directly accessible to the application layer. In HSM-backed implementations, the
	 * private key never leaves the hardware security module.
	 * @param hash The hash to sign (typically SHA-256 hash of PDF byte ranges)
	 * @return Signed hash bytes (raw signature, not wrapped in CMS/PKCS#7)
	 * @throws SignatureProviderException if signing operation fails
	 */
	byte[] signHash(byte[] hash) throws SignatureProviderException;

	/**
	 * Retrieve the certificate chain for signature validation.
	 *
	 * The certificate chain is required for embedding in the PDF signature to allow
	 * third-party verification. The chain should be ordered from leaf (end-entity
	 * certificate) to root (trusted CA).
	 * @return X509Certificate array [leaf, intermediate(s), root]
	 * @throws SignatureProviderException if certificate chain cannot be retrieved
	 */
	X509Certificate[] getCertificateChain() throws SignatureProviderException;

	/**
	 * Get the signature algorithm identifier.
	 *
	 * This should return the algorithm name in standard format, e.g.: - "SHA256withRSA"
	 * for RSA signatures - "SHA256withECDSA" for ECDSA signatures
	 * @return Signature algorithm name
	 */
	String getSignatureAlgorithm();

	/**
	 * Test provider connectivity and operational status.
	 *
	 * This method should verify that the provider is accessible, authenticated, and ready
	 * to perform signing operations. For local providers, this might check file access.
	 * For cloud providers, this would test API connectivity and authentication.
	 * @return true if provider is operational, false otherwise
	 */
	boolean testConnection();

	/**
	 * Get the provider type for logging and monitoring purposes.
	 * @return Provider type enum value
	 */
	SignatureProviderType getProviderType();

}
