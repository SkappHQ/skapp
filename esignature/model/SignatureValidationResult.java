package com.skapp.enterprise.esignature.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Result of PDF signature validation.
 *
 * This contains information about the cryptographic validity of a PDF signature,
 * including certificate chain validation, signature integrity, and any warnings.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignatureValidationResult {

	/**
	 * Overall signature validity.
	 */
	private boolean valid;

	/**
	 * Whether the signature is cryptographically intact (not tampered).
	 */
	private boolean signatureIntact;

	/**
	 * Whether the document has been modified after signing.
	 */
	private boolean documentModified;

	/**
	 * Whether the signing certificate is valid (not expired, not revoked).
	 */
	private boolean certificateValid;

	/**
	 * Signer name from certificate.
	 */
	private String signerName;

	/**
	 * Certificate serial number.
	 */
	private String certificateSerialNumber;

	/**
	 * Signature algorithm used.
	 */
	private String signatureAlgorithm;

	/**
	 * When the document was signed.
	 */
	private LocalDateTime signedAt;

	/**
	 * Whether a timestamp token is present (for LTV).
	 */
	private boolean hasTimestamp;

	/**
	 * Timestamp authority timestamp (if present).
	 */
	private LocalDateTime timestampTime;

	/**
	 * List of validation warnings or errors.
	 */
	@Builder.Default
	private List<String> validationMessages = new ArrayList<>();

	/**
	 * Add a validation message.
	 * @param message The message to add
	 */
	public void addValidationMessage(String message) {
		if (this.validationMessages == null) {
			this.validationMessages = new ArrayList<>();
		}
		this.validationMessages.add(message);
	}

}
