package com.skapp.enterprise.esignature.eid.payload.response;

import com.skapp.enterprise.esignature.eid.type.EidProviderType;
import com.skapp.enterprise.esignature.eid.type.EidVerificationStatus;
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
	 * Token for QR code generation (other-device flow).
	 */
	private String qrStartToken;

	/**
	 * Secret for animated QR code generation.
	 */
	private String qrStartSecret;

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
