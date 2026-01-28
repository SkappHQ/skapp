package com.skapp.enterprise.esignature.eid.bankid.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for BankID /cancel endpoint.
 *
 * <p>
 * Cancels an ongoing sign or auth order. This should be used when the user wants to
 * cancel the order or when the RP no longer needs the order.
 * </p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BankIdCancelRequest {

	/**
	 * The orderRef returned from the /sign call.
	 */
	private String orderRef;

}
