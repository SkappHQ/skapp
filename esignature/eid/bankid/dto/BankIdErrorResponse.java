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
 * <p>
 * Common error codes:
 * <ul>
 * <li>invalidParameters - Missing or invalid request parameters (HTTP 400)</li>
 * <li>alreadyInProgress - A sign/auth order is already in progress for this user</li>
 * <li>unauthorized - Invalid certificate or authentication (HTTP 401)</li>
 * <li>notFound - Order not found or expired (HTTP 404)</li>
 * <li>methodNotAllowed - Wrong HTTP method (HTTP 405)</li>
 * <li>requestTimeout - Request timeout</li>
 * <li>unsupportedMediaType - Invalid Content-Type</li>
 * <li>internalError - Server error (HTTP 500)</li>
 * <li>maintenance - Service maintenance (HTTP 503)</li>
 * </ul>
 * </p>
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
