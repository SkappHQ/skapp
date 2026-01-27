package com.skapp.enterprise.esignature.eid.bankid.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO from BankID /collect endpoint.
 *
 * <p>
 * The response structure varies based on the status:
 * <ul>
 * <li>pending: Contains orderRef, status, hintCode</li>
 * <li>failed: Contains orderRef, status, hintCode</li>
 * <li>complete: Contains orderRef, status, completionData</li>
 * </ul>
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankIdCollectResponse {

	/**
	 * Reference to this order.
	 */
	private String orderRef;

	/**
	 * Status of the order. One of: "pending", "failed", "complete".
	 */
	private String status;

	/**
	 * Hint code providing more details about the current status. Present when status is
	 * "pending" or "failed".
	 *
	 * Pending hint codes: outstandingTransaction, noClient, started, userSign
	 *
	 * Failed hint codes: expiredTransaction, certificateErr, userCancel, cancelled,
	 * startFailed
	 */
	private String hintCode;

	/**
	 * Completion data containing user info and signature. Only present when status is
	 * "complete".
	 */
	private BankIdCompletionData completionData;

}
