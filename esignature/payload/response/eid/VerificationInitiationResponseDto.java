package com.skapp.enterprise.esignature.payload.response.eid;

import com.skapp.enterprise.esignature.type.EidProviderType;
import com.skapp.enterprise.esignature.type.EidVerificationStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Response DTO for verification initiation. Contains all information needed by frontend
 * to start the eID flow.
 */
@Getter
@Setter
@Builder
public class VerificationInitiationResponseDto {

	/**
	 * Unique session identifier (UUID) for tracking this verification.
	 */
	private String sessionId;

	/**
	 * Provider type (e.g., SWEDISH_BANKID).
	 */
	private EidProviderType providerType;

	/**
	 * Current status of the verification.
	 */
	private EidVerificationStatus status;

	/**
	 * Token for same-device auto-start (opens BankID app directly). Used to construct:
	 * bankid:///?autostarttoken={autoStartToken}&redirect={returnUrl}
	 */
	private String autoStartToken;

	/**
	 * Pre-computed QR code data for cross-device flow. Format:
	 * bankid.{qrStartToken}.{time}.{qrAuthCode} where qrAuthCode =
	 * HMAC_SHA256(qrStartSecret, time). This is refreshed on each status poll.
	 */
	private String qrCode;

	/**
	 * When the session will expire.
	 */
	private Instant expiresAt;

	/**
	 * Recipient ID for this verification.
	 */
	private Long recipientId;

	/**
	 * Document ID being signed.
	 */
	private Long documentId;

}
