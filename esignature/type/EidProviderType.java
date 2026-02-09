package com.skapp.enterprise.esignature.type;

/**
 * Enum representing supported eID verification providers. Note: SMS MFA is NOT included
 * here as it's a separate mechanism for document access control. eID verification is
 * specifically for signing identity verification with cryptographic binding.
 */
public enum EidProviderType {

	SWEDISH_BANKID("sv_SE"), NONE(null);

	private final String locale;

	EidProviderType(String locale) {
		this.locale = locale;
	}

	public String getLocale() {
		return locale;
	}

	/**
	 * Check if this provider type requires actual eID verification.
	 * @return true if verification is required, false for NONE
	 */
	public boolean requiresVerification() {
		return this != NONE;
	}

}
