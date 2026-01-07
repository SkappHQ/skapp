package com.skapp.enterprise.esignature.signature;

import com.skapp.community.common.exception.ModuleException;
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
	 * Sign the data using the configured private key.
	 *
	 * <p>
	 * <strong>Important:</strong> The input is the raw data (e.g., CMS SignedAttributes),
	 * not a pre-calculated hash. Implementations are responsible for hashing this data if
	 * their underlying signing mechanism requires a digest (e.g., Cloud HSMs).
	 * </p>
	 *
	 * <ul>
	 * <li><strong>Local Provider:</strong> Should use an algorithm like "SHA256withRSA"
	 * which handles hashing internally.</li>
	 * <li><strong>Cloud HSM:</strong> Should calculate the SHA-256 hash of the input
	 * bytes, then send that digest to the HSM.</li>
	 * </ul>
	 * @param contentToSign The raw content bytes to be signed
	 * @return Signed bytes (raw signature)
	 * @throws ModuleException if signing operation fails
	 */
	byte[] signHash(byte[] contentToSign) throws ModuleException;

	/**
	 * Retrieve the certificate chain for signature validation.
	 *
	 * The certificate chain is required for embedding in the PDF signature to allow
	 * third-party verification. The certificate chain is ordered from leaf certificate to
	 * root CA, including any intermediate certificates.
	 * @return X509Certificate array ordered from leaf certificate to root CA
	 * @throws ModuleException if certificate chain cannot be retrieved
	 */
	X509Certificate[] getCertificateChain() throws ModuleException;

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
