package com.skapp.enterprise.esignature.eid.bankid.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Error response from BankID API.
 *
 * <p>
 * Returned when an API call fails. Contains an error code and optional details.
 * </p>
 *
 * @see <a href="https://developers.bankid.com/api-references/errors">BankID API Errors
 * Reference</a>
 */
@Data
@NoArgsConstructor
public class BankIdErrorResponse {

	/**
	 * Error code identifying the type of error.
	 */
	private String errorCode;

	/**
	 * Optional additional details about the error.
	 */
	private String details;

}
