package com.skapp.enterprise.esignature.eid.bankid.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Completion data returned when a BankID order completes successfully.
 *
 * <p>
 * Contains information about the user who signed, their device, and the actual signature
 * data.
 * </p>
 */
@Data
@NoArgsConstructor
public class BankIdCompletionData {

	/**
	 * Information about the user who signed.
	 */
	private BankIdUser user;

	/**
	 * Information about the device used for signing.
	 */
	private BankIdDevice device;

	/**
	 * The signature in Base64 encoded format. The signature is an XML structure
	 * containing the signed data according to the BankID signature format specification.
	 */
	private String signature;

	/**
	 * The OCSP (Online Certificate Status Protocol) response in Base64 encoded format.
	 * Proves the certificate was valid at the time of signing.
	 */
	private String ocspResponse;

}
