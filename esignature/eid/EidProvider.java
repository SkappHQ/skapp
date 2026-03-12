package com.skapp.enterprise.esignature.eid;

import com.skapp.enterprise.esignature.model.EidVerificationSession;
import com.skapp.enterprise.esignature.payload.response.eid.ProviderFrontendConfigDto;
import com.skapp.enterprise.esignature.type.EidProviderType;

/**
 * Interface for eID verification providers (e.g., Swedish BankID, Norwegian BankID).
 *
 * Implementations of this interface provide the actual verification mechanism. The
 * application layer should depend only on this interface, not on concrete
 * implementations, allowing seamless switching between providers.
 */
public interface EidProvider {

	/**
	 * Get the provider type identifier.
	 * @return Provider type enum value
	 */
	EidProviderType getProviderType();

	/**
	 * Check if this provider is currently enabled and available.
	 * @return true if provider can be used, false otherwise
	 */
	boolean isEnabled();

	/**
	 * Initiate a signing/verification session.
	 *
	 * <p>
	 * For BankID, this calls the /sign endpoint which creates a signing order that binds
	 * the user's identity to the document hash.
	 * </p>
	 * @param recipientId ID of the recipient being verified
	 * @param documentId ID of the document being signed
	 * @param endUserIp IP address of the end user (required by BankID)
	 * @param userVisibleData Text shown to user in eID app (Base64 encoded for BankID)
	 * @param documentHash SHA-3-256 hash of the document (Base64-encoded string)
	 * @return Session with provider-specific data (autoStartToken, qrStartToken, etc.)
	 */
	EidVerificationSession initiateVerification(Long recipientId, Long documentId, String endUserIp,
			String userVisibleData, String documentHash);

	/**
	 * Check the current status of a verification session.
	 *
	 * <p>
	 * For BankID, this calls the /collect endpoint to poll for status updates.
	 * </p>
	 * @param session The session to check
	 * @return Updated session with current status
	 */
	EidVerificationSession checkStatus(EidVerificationSession session);

	/**
	 * Cancel an ongoing verification session.
	 *
	 * <p>
	 * For BankID, this calls the /cancel endpoint.
	 * </p>
	 * @param session The session to cancel
	 */
	void cancelVerification(EidVerificationSession session);

	/**
	 * Initiate an identification-only session (auth flow, no document hash).
	 *
	 * <p>
	 * For BankID, this calls the /auth endpoint which creates an identification order
	 * that verifies the user's identity without binding to a specific document hash.
	 * </p>
	 * @param recipientId ID of the recipient being identified
	 * @param documentId Optional ID of the document this identification is for
	 * @param endUserIp IP address of the end user (required by BankID)
	 * @param userVisibleData Optional text shown to the user in the eID app (plain text,
	 * will be Base64 encoded)
	 * @return Session with provider-specific data (autoStartToken, qrStartToken, etc.)
	 */
	EidVerificationSession initiateIdentification(Long recipientId, Long documentId, String endUserIp,
			String userVisibleData);

	/**
	 * Get frontend configuration for this provider.
	 *
	 * <p>
	 * Returns provider-specific settings needed by the frontend, such as polling
	 * intervals, timeout durations, and UI customization options.
	 * </p>
	 * @return Frontend configuration DTO
	 */
	ProviderFrontendConfigDto getFrontendConfig();

}
