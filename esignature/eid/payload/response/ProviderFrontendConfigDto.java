package com.skapp.enterprise.esignature.eid.payload.response;

import com.skapp.enterprise.esignature.eid.type.EidProviderType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * Frontend configuration for an eID provider.
 */
@Getter
@Setter
@Builder
public class ProviderFrontendConfigDto {

	/**
	 * Provider type.
	 */
	private EidProviderType providerType;

	/**
	 * Display name for UI.
	 */
	private String displayName;

	/**
	 * How often frontend should poll for status updates (milliseconds).
	 */
	private int pollIntervalMs;

	/**
	 * Session timeout duration (seconds).
	 */
	private int sessionTimeoutSeconds;

	/**
	 * Whether QR code flow is supported.
	 */
	private boolean qrCodeEnabled;

	/**
	 * Whether same-device auto-start is supported.
	 */
	private boolean sameDeviceEnabled;

	/**
	 * URL scheme for same-device launch (e.g., "bankid://").
	 */
	private String autoStartScheme;

	/**
	 * Whether this is a mock provider (for testing).
	 */
	private boolean mockMode;

}
