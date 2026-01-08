package com.skapp.enterprise.esignature.signature.azure;

import com.azure.core.credential.TokenCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.security.keyvault.certificates.CertificateClient;
import com.azure.security.keyvault.certificates.CertificateClientBuilder;
import com.azure.security.keyvault.certificates.models.KeyVaultCertificateWithPolicy;
import com.azure.security.keyvault.keys.KeyClient;
import com.azure.security.keyvault.keys.KeyClientBuilder;
import com.azure.security.keyvault.keys.cryptography.CryptographyClient;
import com.azure.security.keyvault.keys.cryptography.CryptographyClientBuilder;
import com.azure.security.keyvault.keys.cryptography.models.SignResult;
import com.azure.security.keyvault.keys.cryptography.models.SignatureAlgorithm;
import com.azure.security.keyvault.keys.models.JsonWebKey;
import com.azure.security.keyvault.keys.models.KeyVaultKey;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.model.SignatureProviderType;
import com.skapp.enterprise.esignature.signature.SignatureProvider;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.ByteArrayInputStream;
import java.security.MessageDigest;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;

/**
 * Azure Key Vault signature provider for production environments.
 *
 * This implementation uses Azure Key Vault Premium with HSM-backed keys for production
 * PDF signing. The private key remains in the Azure HSM and never leaves it.
 *
 * Security characteristics: - Private key stored in FIPS 140-2 Level 2+ HSM - Signing via
 * Azure Key Vault REST API - Supports RSA and ECDSA algorithms - Certificate from trusted
 * CA
 *
 * Activated when: skapp.pdf-signing.provider=azure
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "skapp.pdf-signing.provider", havingValue = "azure")
public class AzureKeyVaultSignatureProvider implements SignatureProvider {

	@Value("${skapp.pdf-signing.azure.key-vault-url}")
	private String keyVaultUrl;

	@Value("${skapp.pdf-signing.azure.tenant-id:}")
	private String tenantId;

	@Value("${skapp.pdf-signing.azure.client-id:}")
	private String clientId;

	@Value("${skapp.pdf-signing.azure.client-secret:}")
	private String clientSecret;

	@Value("${skapp.pdf-signing.azure.key-name}")
	private String keyName;

	@Value("${skapp.pdf-signing.azure.certificate-name}")
	private String certificateName;

	// JCA Algorithm Constants
	private static final String ALGO_SHA_256 = "SHA-256";

	private static final String ALGO_SHA_384 = "SHA-384";

	private static final String ALGO_SHA_512 = "SHA-512";

	private static final String SIG_ALGO_RSA_SHA256 = "SHA256withRSA";

	private static final String SIG_ALGO_ECDSA_SHA256 = "SHA256withECDSA";

	private static final String SIG_ALGO_ECDSA_SHA384 = "SHA384withECDSA";

	private static final String SIG_ALGO_ECDSA_SHA512 = "SHA512withECDSA";

	// Elliptic Curve Constants
	private static final String CURVE_P_384 = "P-384";

	private static final String CURVE_P_521 = "P-521";

	// Key Type Constants
	private static final String KEY_TYPE_RSA = "RSA";

	private static final String KEY_TYPE_RSA_HSM = "RSA-HSM";

	private static final String KEY_TYPE_EC = "EC";

	private static final String KEY_TYPE_EC_HSM = "EC-HSM";

	// Hash algorithm (determined at runtime)
	private String hashAlgorithm = ALGO_SHA_256;

	// Azure Key Vault clients (initialized in @PostConstruct)
	private CryptographyClient cryptographyClient;

	private CertificateClient certificateClient;

	private KeyClient keyClient;

	// Cached data (loaded at initialization)
	private X509Certificate[] certificateChain;

	private String signatureAlgorithm;

	private SignatureAlgorithm azureSignatureAlgorithm;

	/**
	 * Initialize Azure Key Vault clients and load certificate chain at application
	 * startup.
	 */
	@PostConstruct
	public void init() {
		try {
			// Normalize Key Vault URL by removing trailing slash if present
			if (StringUtils.hasText(keyVaultUrl) && keyVaultUrl.endsWith("/")) {
				keyVaultUrl = keyVaultUrl.substring(0, keyVaultUrl.length() - 1);
			}

			log.info("Initializing AzureKeyVaultSignatureProvider");
			log.info("  - Key Vault URL: {}", keyVaultUrl);
			log.info("  - Key Name: {}", keyName);
			log.info("  - Certificate Name: {}", certificateName);

			// 1. Validate configuration
			validateConfiguration();

			// 2. Create authentication credential
			TokenCredential credential = createCredential();

			// 3. Initialize Management clients
			initializeCertificateClient(credential);
			initializeKeyClient(credential);

			// 4. Load certificate and determine correct Key Version
			String specificKeyId = loadCertificateAndGetKeyId();

			// 5. Initialize Cryptography client with specific Key Version
			initializeCryptographyClient(credential, specificKeyId);

			// 6. Determine signature algorithm
			determineSignatureAlgorithm();

			// 7. Test connectivity
			if (!testConnection()) {
				throw new IllegalStateException("Azure Key Vault connection test failed");
			}

			log.info("AzureKeyVaultSignatureProvider initialized successfully");
			log.info("  - Signature algorithm: {}", signatureAlgorithm);
			log.info("  - Certificate subject: {}", certificateChain[0].getSubjectX500Principal());
			log.info("  - Certificate valid until: {}", certificateChain[0].getNotAfter());
			log.info("  - Certificate chain length: {}", certificateChain.length);

		}
		catch (Exception e) {
			log.error("Failed to initialize AzureKeyVaultSignatureProvider", e);
			throw new IllegalStateException("Failed to initialize AzureKeyVaultSignatureProvider", e);
		}
	}

	private void validateConfiguration() {
		if (!StringUtils.hasText(keyVaultUrl)) {
			throw new IllegalStateException("Azure Key Vault URL is not configured");
		}
		if (!StringUtils.hasText(keyName)) {
			throw new IllegalStateException("Azure Key name is not configured");
		}
		if (!StringUtils.hasText(certificateName)) {
			throw new IllegalStateException("Azure Certificate name is not configured");
		}

		log.debug("Configuration validation passed");
	}

	private TokenCredential createCredential() {
		// Use service principal if explicitly configured; otherwise rely on
		// DefaultAzureCredential (Managed Identity, CLI, etc.)
		if (StringUtils.hasText(tenantId) && StringUtils.hasText(clientId) && StringUtils.hasText(clientSecret)) {
			log.info("Using Service Principal authentication");
			return new ClientSecretCredentialBuilder().tenantId(tenantId)
				.clientId(clientId)
				.clientSecret(clientSecret)
				.build();
		}
		else {
			log.info("Using DefaultAzureCredential authentication (supports Managed Identity)");
			return new DefaultAzureCredentialBuilder().build();
		}
	}

	private void initializeCertificateClient(TokenCredential credential) {
		certificateClient = new CertificateClientBuilder().vaultUrl(keyVaultUrl).credential(credential).buildClient();
		log.debug("Azure Key Vault Certificate client initialized");
	}

	private void initializeKeyClient(TokenCredential credential) {
		keyClient = new KeyClientBuilder().vaultUrl(keyVaultUrl).credential(credential).buildClient();
		log.debug("Azure Key Vault Key client initialized");
	}

	private void initializeCryptographyClient(TokenCredential credential, String keyId) {
		cryptographyClient = new CryptographyClientBuilder().credential(credential).keyIdentifier(keyId).buildClient();
		log.debug("Azure Key Vault cryptography client initialized with Key ID: {}", keyId);
	}

	private String loadCertificateAndGetKeyId() throws Exception {
		log.debug("Loading certificate chain from Azure Key Vault");

		KeyVaultCertificateWithPolicy certificate = certificateClient.getCertificate(certificateName);

		if (certificate == null) {
			throw new IllegalStateException("Certificate not found in Key Vault: " + certificateName);
		}

		certificateChain = parseCertificateChain(certificate);

		log.debug("Certificate chain loaded: {} certificates", certificateChain.length);

		// Extract Key ID to ensure we sign with the exact key version matching the cert
		String keyId = certificate.getKeyId();
		if (StringUtils.hasText(keyId)) {
			log.info("Using Key ID from certificate: {}", keyId);
			return keyId;
		}
		else {
			// A valid Azure Key Vault Certificate always has a backing key identifier.
			// If this is missing, the certificate state is invalid/corrupted.
			throw new IllegalStateException(
					"Certificate in Azure Key Vault is missing the required Key Identifier (kid)");
		}
	}

	private X509Certificate[] parseCertificateChain(KeyVaultCertificateWithPolicy certificate) throws Exception {
		// Azure Key Vault stores the complete certificate chain in the 'cer' property
		byte[] certBytes = certificate.getCer();

		if (certBytes == null || certBytes.length == 0) {
			throw new IllegalStateException("Certificate data is empty");
		}

		// Parse X.509 certificate(s)
		CertificateFactory certFactory = CertificateFactory.getInstance("X.509");

		// Try to parse the full chain (works for P7B or sequence of certs)
		try (ByteArrayInputStream bis = new ByteArrayInputStream(certBytes)) {
			java.util.Collection<? extends java.security.cert.Certificate> certificates = certFactory
				.generateCertificates(bis);

			if (certificates.isEmpty()) {
				throw new IllegalStateException("No certificates parsed from Key Vault");
			}

			List<X509Certificate> x509Certificates = new ArrayList<>();
			for (java.security.cert.Certificate cert : certificates) {
				if (cert instanceof X509Certificate) {
					x509Certificates.add((X509Certificate) cert);
				}
			}

			if (x509Certificates.isEmpty()) {
				throw new IllegalStateException("No X.509 certificates found in Key Vault certificate data");
			}

			if (x509Certificates.size() == 1) {
				log.warn(
						"Only one certificate found in chain. PDF validation may fail if intermediate CAs are missing.");
			}

			log.debug("Parsed {} certificate(s) from Azure Key Vault", x509Certificates.size());

			return x509Certificates.toArray(new X509Certificate[0]);
		}
	}

	private void determineSignatureAlgorithm() throws Exception {
		// Retrieve key metadata using the cryptography client (ensures we get the exact
		// version)
		KeyVaultKey key = cryptographyClient.getKey();
		JsonWebKey jsonWebKey = key.getKey();

		String keyType = jsonWebKey.getKeyType() != null ? jsonWebKey.getKeyType().toString() : null;
		String curveName = jsonWebKey.getCurveName() != null ? jsonWebKey.getCurveName().toString() : null;

		log.info("Key properties - Type: {}, Curve: {}", keyType, curveName);

		// Map key type to signature algorithm
		if (KEY_TYPE_RSA.equalsIgnoreCase(keyType) || KEY_TYPE_RSA_HSM.equalsIgnoreCase(keyType)) {
			// For RSA, we default to SHA-256/RS256, but could support stronger variants
			// if needed
			hashAlgorithm = ALGO_SHA_256;
			signatureAlgorithm = SIG_ALGO_RSA_SHA256;
			azureSignatureAlgorithm = SignatureAlgorithm.RS256;
		}
		else if (KEY_TYPE_EC.equalsIgnoreCase(keyType) || KEY_TYPE_EC_HSM.equalsIgnoreCase(keyType)) {
			if (CURVE_P_384.equalsIgnoreCase(curveName)) {
				hashAlgorithm = ALGO_SHA_384;
				signatureAlgorithm = SIG_ALGO_ECDSA_SHA384;
				azureSignatureAlgorithm = SignatureAlgorithm.ES384;
			}
			else if (CURVE_P_521.equalsIgnoreCase(curveName)) {
				hashAlgorithm = ALGO_SHA_512;
				signatureAlgorithm = SIG_ALGO_ECDSA_SHA512;
				azureSignatureAlgorithm = SignatureAlgorithm.ES512;
			}
			else {
				// Default to P-256
				hashAlgorithm = ALGO_SHA_256;
				signatureAlgorithm = SIG_ALGO_ECDSA_SHA256;
				azureSignatureAlgorithm = SignatureAlgorithm.ES256;
			}
		}
		else {
			throw new IllegalStateException("Unsupported key type: " + keyType);
		}

		log.info("Determined algorithms - Hash: {}, Java Sig: {}, Azure Sig: {}", hashAlgorithm, signatureAlgorithm,
				azureSignatureAlgorithm);
	}

	@Override
	public byte[] signContent(byte[] contentToSign) throws ModuleException {
		try {
			log.debug("Signing data with Azure Key Vault (algorithm: {})", azureSignatureAlgorithm);

			// Azure Key Vault expects a pre-computed digest
			// We must hash the content first, then sign the hash
			MessageDigest digest = MessageDigest.getInstance(hashAlgorithm);
			byte[] hash = digest.digest(contentToSign);

			log.debug("Computed {} hash (length: {} bytes)", hashAlgorithm, hash.length);

			// Sign the hash using Azure Key Vault
			SignResult signResult = cryptographyClient.sign(azureSignatureAlgorithm, hash);
			byte[] signature = signResult.getSignature();

			log.debug("Content signed successfully (signature length: {} bytes)", signature.length);
			return signature;

		}
		catch (Exception e) {
			log.error("Failed to sign content with Azure Key Vault", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_SIGNATURE_PROVIDER_OPERATION_FAILED);
		}
	}

	@Override
	public X509Certificate[] getCertificateChain() throws ModuleException {
		if (certificateChain == null || certificateChain.length == 0) {
			log.error("Certificate chain is not loaded");
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
			log.debug("Testing Azure Key Vault connection");

			// Test 1: Verify certificate is accessible
			KeyVaultCertificateWithPolicy cert = certificateClient.getCertificate(certificateName);
			if (cert == null) {
				log.error("Certificate not found: {}", certificateName);
				return false;
			}

			// Test 2: Verify key is accessible
			KeyVaultKey key = keyClient.getKey(keyName);
			if (key == null) {
				log.error("Key not found: {}", keyName);
				return false;
			}

			// Test 3: Verify key is enabled
			if (!key.getProperties().isEnabled()) {
				log.error("Key is disabled: {}", keyName);
				return false;
			}

			log.debug("Azure Key Vault connection test successful");
			return true;

		}
		catch (Exception e) {
			log.error("Azure Key Vault connection test failed", e);
			return false;
		}
	}

	@Override
	public SignatureProviderType getProviderType() {
		return SignatureProviderType.AZURE_KEY_VAULT;
	}

}
