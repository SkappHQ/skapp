package com.skapp.enterprise.esignature.signature.azure;

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
 * Azure Key Vault certificate provider for production environments.
 *
 * This implementation manages certificate lifecycle for Azure Key Vault, including
 * certificate loading and expiration monitoring. It delegates to the
 * AzureKeyVaultSignatureProvider which maintains the Azure Key Vault connection and
 * certificate cache.
 *
 * Activated when: skapp.pdf-signing.provider=azure
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "skapp.pdf-signing.provider", havingValue = "azure")
public class AzureKeyVaultCertificateProvider implements CertificateProvider {

	private final SignatureProvider signatureProvider;

	@Override
	public X509Certificate[] loadCertificateChain() {
		try {
			log.debug("Loading certificate chain from Azure Key Vault");
			return signatureProvider.getCertificateChain();
		}
		catch (Exception e) {
			log.error("Failed to load certificate chain from Azure Key Vault", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_CERTIFICATE_CHAIN);
		}
	}

	@Override
	public int getDaysUntilExpiration() {
		try {
			X509Certificate[] chain = loadCertificateChain();
			if (chain == null || chain.length == 0) {
				log.error("Certificate chain is empty");
				return -1;
			}

			// Check leaf certificate (first in chain)
			X509Certificate leafCert = chain[0];
			Instant now = Instant.now();
			Instant expiryDate = leafCert.getNotAfter().toInstant();
			long daysRemaining = ChronoUnit.DAYS.between(now, expiryDate);

			log.debug("Certificate expires in {} days", daysRemaining);

			// Log warnings for certificates nearing expiration
			if (daysRemaining <= 30 && daysRemaining > 0) {
				log.warn("Certificate expires in {} days! Subject: {}", daysRemaining,
						leafCert.getSubjectX500Principal());
			}
			else if (daysRemaining <= 0) {
				log.error("Certificate has EXPIRED! Subject: {}", leafCert.getSubjectX500Principal());
			}

			return (int) daysRemaining;

		}
		catch (Exception e) {
			log.error("Failed to calculate days until expiration", e);
			return -1;
		}
	}

}
