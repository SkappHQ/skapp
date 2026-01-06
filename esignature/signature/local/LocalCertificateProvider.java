package com.skapp.enterprise.esignature.signature.local;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.signature.CertificateProvider;
import com.skapp.enterprise.esignature.signature.SignatureProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.security.cert.X509Certificate;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

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

	@Override
	public X509Certificate[] loadCertificateChain() {
		try {
			return signatureProvider.getCertificateChain();
		}
		catch (Exception e) {
			log.error("Failed to load certificate chain from local keystore", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_CERTIFICATE_CHAIN);
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

}
