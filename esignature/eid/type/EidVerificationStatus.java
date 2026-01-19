package com.skapp.enterprise.esignature.eid.type;

/**
 * Status of an eID verification session.
 */
public enum EidVerificationStatus {

	/**
	 * Verification has not been started.
	 */
	NOT_STARTED,

	/**
	 * Verification is pending - waiting for user action in eID app.
	 */
	PENDING,

	/**
	 * User needs to take action (e.g., open BankID app).
	 */
	USER_ACTION_REQUIRED,

	/**
	 * Verification completed successfully - identity confirmed.
	 */
	VERIFIED,

	/**
	 * Verification failed due to an error.
	 */
	FAILED,

	/**
	 * Verification session expired (BankID has 30 second timeout).
	 */
	EXPIRED,

	/**
	 * User cancelled the verification.
	 */
	CANCELLED

}
