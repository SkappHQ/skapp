package com.skapp.enterprise.esignature.payload.response.eid;

import com.skapp.enterprise.esignature.type.EidProviderType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO for available eID provider information.
 */
@Getter
@Setter
@Builder
public class AvailableProviderResponseDto {

	/**
	 * Provider type identifier.
	 */
	private EidProviderType providerType;

	/**
	 * Human-readable display name.
	 */
	private String displayName;

	/**
	 * Whether this provider is currently enabled.
	 */
	private boolean enabled;

	/**
	 * Locale/region for this provider (e.g., "sv_SE" for Swedish BankID).
	 */
	private String locale;

	/**
	 * Frontend configuration for this provider.
	 */
	private ProviderFrontendConfigDto frontendConfig;

}
