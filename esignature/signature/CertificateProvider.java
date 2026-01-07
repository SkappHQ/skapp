package com.skapp.enterprise.esignature.signature;

import java.security.cert.X509Certificate;

/**
 * Interface for certificate lifecycle management and validation.
 *
 * Implementations of this interface handle: - Loading certificate chains from various
 * sources - Validating certificate status (expiration, revocation) - Extracting
 * certificate metadata - Monitoring certificate health
 *
 * This interface is separate from SignatureProvider to allow independent management of
 * certificate concerns vs. signing operations.
 */
public interface CertificateProvider {

	/**
	 * Load the complete certificate chain from the provider.
	 *
	 * The chain should be ordered from leaf (end-entity) to root CA. For local
	 * development, this might be a single self-signed certificate. For production, this
	 * should include intermediate and root CA certificates.
	 * @return X509Certificate array [leaf, intermediate(s), root]
	 * @throws ModuleException if certificate chain cannot be loaded
	 */
	X509Certificate[] loadCertificateChain();

	/**
	 * Get the number of days until certificate expiration.
	 * @return Days remaining (positive), 0 if expires today, negative if expired
	 */
	int getDaysUntilExpiration();

}
