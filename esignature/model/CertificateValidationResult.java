package com.skapp.enterprise.esignature.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Result of certificate validation checks.
 *
 * This includes expiration checks, revocation status, and trust chain validation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateValidationResult {

	/**
	 * Overall validation status.
	 */
	private boolean valid;

	/**
	 * Whether the certificate is expired.
	 */
	private boolean expired;

	/**
	 * Whether the certificate is revoked (CRL/OCSP check). For local development, this
	 * may always be false.
	 */
	private boolean revoked;

	/**
	 * Whether the certificate is expiring soon (< 30 days).
	 */
	private boolean expiringSoon;

	/**
	 * Days remaining until expiration (-1 if expired).
	 */
	private int daysUntilExpiration;

	/**
	 * List of validation errors or warnings.
	 */
	@Builder.Default
	private List<String> validationMessages = new ArrayList<>();

	/**
	 * Timestamp when validation was performed.
	 */
	private java.time.Instant validatedAt;

	/**
	 * Add a validation message (error or warning).
	 * @param message The validation message
	 */
	public void addValidationMessage(String message) {
		if (this.validationMessages == null) {
			this.validationMessages = new ArrayList<>();
		}
		this.validationMessages.add(message);
	}

}
