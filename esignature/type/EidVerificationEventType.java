package com.skapp.enterprise.esignature.type;

/**
 * Event types for eID verification audit logging.
 */
public enum EidVerificationEventType {

	/**
	 * A new verification session was initiated.
	 */
	SESSION_INITIATED,

	/**
	 * Session status was polled/checked.
	 */
	STATUS_POLLED,

	/**
	 * Verification completed successfully.
	 */
	VERIFICATION_COMPLETED,

	/**
	 * Verification failed.
	 */
	VERIFICATION_FAILED,

	/**
	 * User cancelled the verification.
	 */
	VERIFICATION_CANCELLED,

	/**
	 * Verification session expired.
	 */
	VERIFICATION_EXPIRED,

	/**
	 * QR code was generated for cross-device verification.
	 */
	QR_CODE_GENERATED,

	/**
	 * User launched the eID app on same device.
	 */
	SAME_DEVICE_LAUNCH

}
