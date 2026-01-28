package com.skapp.enterprise.esignature.type;

/**
 * Enum representing the type of signature provider being used.
 *
 * This allows the system to track which signing mechanism is active for monitoring,
 * logging, and operational purposes.
 */
public enum SignatureProviderType {

	/**
	 * Local PKCS#12 keystore-based signing (development/testing only). Private key is
	 * stored in an encrypted keystore file on the filesystem. Not suitable for production
	 * use.
	 */
	LOCAL,

	/**
	 * Azure Key Vault Premium with HSM-backed keys. Private key is stored in FIPS 140-2
	 * Level 2+ HSM and never exported. Suitable for production use.
	 */
	AZURE_KEY_VAULT,

	/**
	 * AWS CloudHSM cluster. Private key is stored in FIPS 140-2 Level 3 HSM and never
	 * exported. Suitable for production use.
	 */
	AWS_CLOUDHSM,

	/**
	 * Google Cloud HSM. Private key is stored in FIPS 140-2 Level 3 HSM and never
	 * exported. Suitable for production use.
	 */
	GOOGLE_CLOUD_HSM

}
