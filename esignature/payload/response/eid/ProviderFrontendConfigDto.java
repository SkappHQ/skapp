package com.skapp.enterprise.esignature.payload.response.eid;

import com.skapp.enterprise.esignature.type.EidProviderType;
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
	 * How often frontend should poll for status updates (milliseconds).
	 */
	private Integer pollIntervalMs;

	/**
	 * Session timeout duration (seconds).
	 */
	private Integer sessionTimeoutSeconds;

	/**
	 * Whether QR code flow is supported.
	 */
	private Boolean qrCodeEnabled;

	/**
	 * Whether same-device auto-start is supported.
	 */
	private Boolean sameDeviceEnabled;

	/**
	 * URL scheme for same-device launch (e.g., "bankid://").
	 */
	private String autoStartScheme;

	/**
	 * Whether this is a mock provider (for testing).
	 */
	private Boolean mockMode;

}
