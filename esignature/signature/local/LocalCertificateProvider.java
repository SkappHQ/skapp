package com.skapp.enterprise.esignature.signature.local;

import com.skapp.enterprise.esignature.model.CertificateValidationResult;
import com.skapp.enterprise.esignature.signature.CertificateProvider;
import com.skapp.enterprise.esignature.signature.CertificateProviderException;
import com.skapp.enterprise.esignature.signature.SignatureProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.security.cert.X509Certificate;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * Local certificate provider for development environment.
 *
 * This implementation manages certificate lifecycle for local PKCS#12 keystores. It
 * provides basic validation (expiration checking) but does not perform CRL/OCSP
 * revocation checking since development certificates are self-signed.
 *
 * Activated when: skapp.pdf-signing.provider=local
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "skapp.pdf-signing.provider", havingValue = "local")
public class LocalCertificateProvider implements CertificateProvider {

	private final SignatureProvider signatureProvider;

	private static final int EXPIRATION_WARNING_DAYS = 30;

	@Override
	public X509Certificate[] loadCertificateChain() throws CertificateProviderException {
		try {
			return signatureProvider.getCertificateChain();
		}
		catch (Exception e) {
			log.error("Failed to load certificate chain from local keystore", e);
			throw new CertificateProviderException("Failed to load certificate chain", e);
		}
	}

	@Override
	public CertificateValidationResult validateCertificate() {
		CertificateValidationResult result = CertificateValidationResult.builder().validatedAt(Instant.now()).build();

		try {
			X509Certificate[] chain = loadCertificateChain();
			if (chain == null || chain.length == 0) {
				result.setValid(false);
				result.addValidationMessage("Certificate chain is empty");
				return result;
			}

			X509Certificate cert = chain[0]; // Leaf certificate
			Date now = new Date();

			// Check expiration
			try {
				cert.checkValidity(now);
				result.setExpired(false);
			}
			catch (Exception e) {
				result.setExpired(true);
				result.setValid(false);
				result.addValidationMessage("Certificate expired: " + e.getMessage());
				return result;
			}

			// Calculate days until expiration
			long daysUntilExpiry = calculateDaysUntilExpiration(cert);
			result.setDaysUntilExpiration((int) daysUntilExpiry);

			// Check if expiring soon
			if (daysUntilExpiry <= EXPIRATION_WARNING_DAYS && daysUntilExpiry > 0) {
				result.setExpiringSoon(true);
				result.addValidationMessage("Certificate expires in " + daysUntilExpiry + " days");
			}
			else {
				result.setExpiringSoon(false);
			}

			// For local development, we don't check revocation (self-signed certs)
			result.setRevoked(false);

			// Check if self-signed (development certificate)
			boolean selfSigned = isSelfSigned(cert);
			if (selfSigned) {
				result.addValidationMessage("Development certificate (self-signed) - not suitable for production");
			}

			// Overall validity
			result.setValid(!result.isExpired() && !result.isRevoked());

			log.debug("Certificate validation result: valid={}, expired={}, expiringSoon={}, daysUntilExpiry={}",
					result.isValid(), result.isExpired(), result.isExpiringSoon(), result.getDaysUntilExpiration());

			return result;

		}
		catch (Exception e) {
			log.error("Certificate validation failed", e);
			result.setValid(false);
			result.addValidationMessage("Validation error: " + e.getMessage());
			return result;
		}
	}

	@Override
	public int getDaysUntilExpiration() {
		try {
			X509Certificate[] chain = loadCertificateChain();
			if (chain == null || chain.length == 0) {
				return -1;
			}
			return (int) calculateDaysUntilExpiration(chain[0]);
		}
		catch (Exception e) {
			log.error("Failed to calculate days until expiration", e);
			return -1;
		}
	}

	/**
	 * Calculate days until certificate expiration.
	 */
	private long calculateDaysUntilExpiration(X509Certificate cert) {
		Instant now = Instant.now();
		Instant expiryDate = cert.getNotAfter().toInstant();
		return ChronoUnit.DAYS.between(now, expiryDate);
	}

	/**
	 * Check if certificate is self-signed (issuer == subject).
	 */
	private boolean isSelfSigned(X509Certificate cert) {
		return cert.getSubjectX500Principal().equals(cert.getIssuerX500Principal());
	}

}
