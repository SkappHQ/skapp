package com.skapp.enterprise.esignature.signature.local;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.model.SignatureProviderType;
import com.skapp.enterprise.esignature.signature.SignatureProvider;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.util.Arrays;

/**
 * Local PKCS#12 keystore-based signature provider for development.
 *
 * This implementation loads a private key from a local keystore file and performs signing
 * operations using standard Java cryptography APIs. It is suitable for development and
 * testing ONLY - not for production use.
 *
 * Security characteristics: - Private key stored in password-protected PKCS#12 keystore -
 * Key is loaded into memory at startup - No hardware security module (HSM) protection -
 * Suitable for self-signed certificates only
 *
 * Activated when: skapp.pdf-signing.provider=local
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "skapp.pdf-signing.provider", havingValue = "local")
public class LocalSignatureProvider implements SignatureProvider {

	@Value("${skapp.pdf-signing.local.keystore-path}")
	private Resource keystoreResource;

	@Value("${skapp.pdf-signing.local.keystore-password}")
	private String keystorePassword;

	@Value("${skapp.pdf-signing.local.key-alias}")
	private String keyAlias;

	// Hash algorithm is hardcoded as it's a technical constant, not configuration
	private static final String HASH_ALGORITHM = "SHA256";

	private KeyStore keyStore;

	/**
	 * WARNING: The private key is stored in memory for the lifetime of this bean. This is
	 * acceptable ONLY for local development/testing, where the risk of key exposure via
	 * memory dumps or debugging tools is explicitly accepted.
	 *
	 * Do NOT use this implementation in production. For production, use a signature
	 * provider backed by a Hardware Security Module (HSM) or a remote signing service
	 * that never exposes the private key material to the application process.
	 */
	private PrivateKey privateKey;

	private X509Certificate[] certificateChain;

	private String signatureAlgorithm;

	/**
	 * Initialize keystore and load private key at application startup.
	 */
	@PostConstruct
	public void init() {
		try {
			log.info("Initializing LocalSignatureProvider with keystore: {}", keystoreResource.getDescription());

			// Load PKCS#12 keystore
			keyStore = KeyStore.getInstance("PKCS12");
			try (InputStream keystoreStream = keystoreResource.getInputStream()) {
				keyStore.load(keystoreStream, keystorePassword.toCharArray());
			}

			// Load private key
			privateKey = (PrivateKey) keyStore.getKey(keyAlias, keystorePassword.toCharArray());
			if (privateKey == null) {
				throw new IllegalStateException("Private key not found in keystore with alias: " + keyAlias);
			}

			// Load certificate chain
			Certificate[] certs = keyStore.getCertificateChain(keyAlias);
			if (certs == null || certs.length == 0) {
				throw new IllegalStateException("Certificate chain not found in keystore with alias: " + keyAlias);
			}

			certificateChain = Arrays.stream(certs).map(cert -> (X509Certificate) cert).toArray(X509Certificate[]::new);

			// Determine signature algorithm based on key type
			String keyAlg = privateKey.getAlgorithm();
			if ("RSA".equals(keyAlg)) {
				signatureAlgorithm = HASH_ALGORITHM + "withRSA";
			}
			else if ("EC".equals(keyAlg)) {
				signatureAlgorithm = HASH_ALGORITHM + "withECDSA";
			}
			else {
				throw new IllegalStateException("Unsupported key algorithm: " + keyAlg);
			}

			log.info("LocalSignatureProvider initialized successfully");
			log.info("  - Key algorithm: {}", keyAlg);
			log.info("  - Signature algorithm: {}", signatureAlgorithm);
			log.info("  - Certificate subject: {}", certificateChain[0].getSubjectX500Principal());
			log.info("  - Certificate valid until: {}", certificateChain[0].getNotAfter());
			log.warn("  - WARNING: Using local keystore for PDF signing (DEVELOPMENT ONLY)");

		}
		catch (Exception e) {
			log.error("Failed to initialize LocalSignatureProvider", e);
			throw new IllegalStateException("Failed to initialize LocalSignatureProvider", e);
		}
	}

	@Override
	public byte[] signHash(byte[] contentToSign) throws ModuleException {
		try {
			log.debug("Signing data with local private key (algorithm: {})", signatureAlgorithm);

			// Create signature instance
			Signature signature = Signature.getInstance(signatureAlgorithm);
			signature.initSign(privateKey);

			// Sign the data (CMS SignedAttributes)
			// Note: The Signature instance (e.g., SHA256withRSA) handles the hashing
			// internally.
			signature.update(contentToSign);
			byte[] signedHash = signature.sign();

			log.debug("Hash signed successfully (signature length: {} bytes)", signedHash.length);
			return signedHash;

		}
		catch (Exception e) {
			log.error("Failed to sign hash with local private key", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_SIGNATURE_PROVIDER_OPERATION_FAILED);
		}
	}

	@Override
	public X509Certificate[] getCertificateChain() throws ModuleException {
		if (certificateChain == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_CERTIFICATE_CHAIN);
		}
		return certificateChain;
	}

	@Override
	public String getSignatureAlgorithm() {
		return signatureAlgorithm;
	}

	@Override
	public boolean testConnection() {
		try {
			// For local provider, test that we can access the keystore and key
			return keyStore != null && privateKey != null && certificateChain != null && certificateChain.length > 0;
		}
		catch (Exception e) {
			log.error("LocalSignatureProvider connection test failed", e);
			return false;
		}
	}

	@Override
	public SignatureProviderType getProviderType() {
		return SignatureProviderType.LOCAL;
	}

}
