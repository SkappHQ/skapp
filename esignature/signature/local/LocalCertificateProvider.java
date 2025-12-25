package com.skapp.enterprise.esignature.signature.local;

import com.skapp.enterprise.esignature.model.CertificateMetadata;
import com.skapp.enterprise.esignature.model.CertificateValidationResult;
import com.skapp.enterprise.esignature.signature.CertificateProvider;
import com.skapp.enterprise.esignature.signature.CertificateProviderException;
import com.skapp.enterprise.esignature.signature.SignatureProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import javax.security.auth.x500.X500Principal;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.cert.X509Certificate;
import java.security.interfaces.ECPublicKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
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

	@Override
	public CertificateMetadata getCertificateMetadata() throws CertificateProviderException {
		try {
			X509Certificate[] chain = loadCertificateChain();
			if (chain == null || chain.length == 0) {
				throw new CertificateProviderException("Certificate chain is empty");
			}

			X509Certificate cert = chain[0];

			// Extract subject and issuer
			X500Principal subject = cert.getSubjectX500Principal();
			X500Principal issuer = cert.getIssuerX500Principal();

			// Extract serial number
			String serialNumber = cert.getSerialNumber().toString(16).toUpperCase();

			// Extract validity dates
			LocalDateTime validFrom = LocalDateTime.ofInstant(cert.getNotBefore().toInstant(), ZoneId.systemDefault());
			LocalDateTime validTo = LocalDateTime.ofInstant(cert.getNotAfter().toInstant(), ZoneId.systemDefault());

			// Extract key information
			PublicKey publicKey = cert.getPublicKey();
			String keyAlgorithm = publicKey.getAlgorithm();
			Integer keySize = extractKeySize(publicKey);

			// Signature algorithm
			String signatureAlgorithm = cert.getSigAlgName();

			// Check if self-signed
			boolean selfSigned = isSelfSigned(cert);

			// Calculate fingerprint (SHA-256 of certificate)
			String fingerprint = calculateFingerprint(cert);

			return CertificateMetadata.builder()
				.subject(subject.getName())
				.issuer(issuer.getName())
				.serialNumber(serialNumber)
				.validFrom(validFrom)
				.validTo(validTo)
				.publicKeyAlgorithm(keyAlgorithm)
				.keySize(keySize)
				.signatureAlgorithm(signatureAlgorithm)
				.selfSigned(selfSigned)
				.fingerprint(fingerprint)
				.build();

		}
		catch (Exception e) {
			log.error("Failed to extract certificate metadata", e);
			throw new CertificateProviderException("Failed to extract certificate metadata", e);
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

	/**
	 * Extract key size from public key.
	 */
	private Integer extractKeySize(PublicKey publicKey) {
		if (publicKey instanceof RSAPublicKey) {
			return ((RSAPublicKey) publicKey).getModulus().bitLength();
		}
		else if (publicKey instanceof ECPublicKey) {
			return ((ECPublicKey) publicKey).getParams().getOrder().bitLength();
		}
		return null;
	}

	/**
	 * Calculate SHA-256 fingerprint of certificate.
	 */
	private String calculateFingerprint(X509Certificate cert) throws Exception {
		MessageDigest md = MessageDigest.getInstance("SHA-256");
		byte[] digest = md.digest(cert.getEncoded());

		// Convert to hex string
		StringBuilder sb = new StringBuilder();
		for (byte b : digest) {
			sb.append(String.format("%02X", b));
			if (sb.length() % 3 == 2 && sb.length() < digest.length * 3 - 1) {
				sb.append(":");
			}
		}
		return sb.toString();
	}

}
