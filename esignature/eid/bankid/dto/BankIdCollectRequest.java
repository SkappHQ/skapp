package com.skapp.enterprise.esignature.eid.bankid.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for BankID /collect endpoint.
 *
 * <p>
 * The collect endpoint is used to poll for the status of an ongoing sign order. It should
 * be called every 2 seconds until the order is complete, failed, or cancelled.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankIdCollectRequest {

	/**
	 * The orderRef returned from the /sign call.
	 */
	private String orderRef;

}
