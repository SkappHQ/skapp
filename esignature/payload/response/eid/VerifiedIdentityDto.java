package com.skapp.enterprise.esignature.payload.response.eid;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * DTO containing verified identity information. Note: Personal number is NOT included for
 * privacy/security reasons.
 */
@Getter
@Setter
@Builder
public class VerifiedIdentityDto {

	private String fullName;

	private String givenName;

	private String surname;

	private Instant verifiedAt;

}
