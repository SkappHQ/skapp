package com.skapp.enterprise.esignature.eid.bankid.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Certificate information from BankID completion data.
 *
 * <p>
 * Contains validity period information for the BankID certificate used during signing.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankIdCert {

	/**
	 * Start of certificate validity period. Format: ISO 8601 date string or milliseconds
	 * since epoch.
	 */
	private String notBefore;

	/**
	 * End of certificate validity period. Format: ISO 8601 date string or milliseconds
	 * since epoch.
	 */
	private String notAfter;

}
