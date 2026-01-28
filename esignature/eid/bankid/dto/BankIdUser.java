package com.skapp.enterprise.esignature.eid.bankid.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User information from BankID completion data.
 *
 * <p>
 * Contains the verified identity information of the person who completed the signing.
 * </p>
 */
@Data
@NoArgsConstructor
public class BankIdUser {

	/**
	 * The personal identity number (personnummer) in format YYYYMMDDNNNN (12 digits).
	 * This is the Swedish national identification number.
	 *
	 * <p>
	 * PRIVACY NOTE: This must be stored encrypted and should never be logged or exposed
	 * unnecessarily.
	 * </p>
	 */
	private String personalNumber;

	/**
	 * The full name of the user as registered in the population register.
	 */
	private String name;

	/**
	 * The given (first) name of the user.
	 */
	private String givenName;

	/**
	 * The surname (family name) of the user.
	 */
	private String surname;

}
