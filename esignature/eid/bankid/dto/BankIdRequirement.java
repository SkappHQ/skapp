package com.skapp.enterprise.esignature.eid.bankid.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Requirements for how the BankID signing must be performed.
 *
 * <p>
 * Optional field in sign/auth requests to specify constraints on the signing process.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BankIdRequirement {

	/**
	 * Requirements for the type of card reader. Values: "class1", "class2". A "class2"
	 * reader must have its own keyboard for PIN entry.
	 */
	private String cardReader;

	/**
	 * List of acceptable certificate policies (OIDs). Used to specify requirements on
	 * which certificates are acceptable.
	 */
	private List<String> certificatePolicies;

	/**
	 * If true, the user must use their PIN code to sign (no fingerprint/face ID). Default
	 * is false.
	 */
	private Boolean pinCode;

}
