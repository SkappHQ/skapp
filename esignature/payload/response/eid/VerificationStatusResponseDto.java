package com.skapp.enterprise.esignature.payload.response.eid;

import com.skapp.enterprise.esignature.type.EidProviderType;
import com.skapp.enterprise.esignature.type.EidVerificationStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Response DTO for verification status check.
 */
@Getter
@Setter
@Builder
public class VerificationStatusResponseDto {

	/**
	 * Session identifier.
	 */
	private String sessionId;

	/**
	 * Provider type.
	 */
	private EidProviderType providerType;

	/**
	 * Current verification status.
	 */
	private EidVerificationStatus status;

	/**
	 * Provider-specific hint code (e.g., "outstandingTransaction", "userSign"). Helps
	 * frontend display appropriate messages.
	 */
	private String hintCode;

	/**
	 * Error code if verification failed.
	 */
	private String errorCode;

	/**
	 * Human-readable error message.
	 */
	private String errorMessage;

	/**
	 * When verification completed (if status is VERIFIED).
	 */
	private Instant completedAt;

	/**
	 * When the session expires.
	 */
	private Instant expiresAt;

	/**
	 * Pre-computed QR code data for cross-device flow. Format:
	 * bankid.{qrStartToken}.{time}.{qrAuthCode}. Refreshed on each poll while session is
	 * pending.
	 */
	private String qrCode;

	/**
	 * Verified identity information (only populated when status is VERIFIED).
	 */
	private VerifiedIdentityDto verifiedIdentity;

}
