package com.skapp.enterprise.esignature.eid.bankid.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for BankID /sign endpoint.
 *
 * <p>
 * The sign endpoint initiates a signing order where the user signs a document or text.
 * The user must have a valid BankID certificate to sign.
 * </p>
 *
 * @see <a href= "https://developers.bankid.com/api-references/auth--sign/overview">BankID
 * Technical Integration Guide</a>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BankIdSignRequest {

	/**
	 * The user's IP address as seen by the RP (Relying Party). Required. IPv4 and IPv6
	 * addresses are supported.
	 */
	private String endUserIp;

	/**
	 * The text to be displayed and signed. Required. The text can be formatted using
	 * simpleMarkdownV1. Must be Base64 encoded.
	 */
	private String userVisibleData;

	/**
	 * Data not displayed to the user but included in the signature. Optional. Typically
	 * used to include document hash. Must be Base64 encoded.
	 */
	private String userNonVisibleData;

}
