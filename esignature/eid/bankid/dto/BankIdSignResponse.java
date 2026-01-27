package com.skapp.enterprise.esignature.eid.bankid.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO from BankID /sign endpoint.
 *
 * <p>
 * Contains tokens needed for initiating the BankID app and generating QR codes.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankIdSignResponse {

	/**
	 * Reference to this signing order. Used when calling /collect or /cancel.
	 */
	private String orderRef;

	/**
	 * Used to compile the start URL for launching BankID app on the same device. Format:
	 * bankid:///?autostarttoken=[autoStartToken]&redirect=[returnUrl]
	 */
	private String autoStartToken;

	/**
	 * Used to generate the animated QR code. Combined with qrStartSecret.
	 */
	private String qrStartToken;

	/**
	 * Used together with qrStartToken to generate the animated QR code. Must be kept
	 * secret - never send to client.
	 */
	private String qrStartSecret;

}
