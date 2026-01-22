package com.skapp.enterprise.esignature.type;

/**
 * Enum representing supported eID verification providers. Note: SMS MFA is NOT included
 * here as it's a separate mechanism for document access control. eID verification is
 * specifically for signing identity verification with cryptographic binding.
 */
public enum EidProviderType {

	SWEDISH_BANKID("Swedish BankID", "sv_SE"),

	NONE("None", null);

	private final String displayName;

	private final String locale;

	EidProviderType(String displayName, String locale) {
		this.displayName = displayName;
		this.locale = locale;
	}

	public String getDisplayName() {
		return displayName;
	}

	public String getLocale() {
		return locale;
	}

}
