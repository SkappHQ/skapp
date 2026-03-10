package com.skapp.enterprise.esignature.eid.bankid.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for BankID /auth endpoint.
 *
 * <p>
 * The auth endpoint initiates an identification order — the user's identity is verified
 * but no document is signed. Only {@code endUserIp} is required.
 * </p>
 *
 * @see <a href="https://developers.bankid.com/api-references/auth--sign/auth">BankID Auth
 * API</a>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BankIdAuthRequest {

	/**
	 * The user's IP address as seen by the RP. Required. IPv4 and IPv6 are supported.
	 */
	private String endUserIp;

	/**
	 * Text displayed to the user during the identification. Optional. Must be Base64
	 * encoded UTF-8.
	 */
	private String userVisibleData;

	/**
	 * Data included but not displayed to the user. Optional. Must be Base64 encoded.
	 */
	private String userNonVisibleData;

	/**
	 * Format of userVisibleData. Optional. One of: "plaintext", "simpleMarkdownV1".
	 */
	private String userVisibleDataFormat;

	/**
	 * URL to redirect the user to after same-device identification completes. Optional.
	 */
	private String returnUrl;

}
