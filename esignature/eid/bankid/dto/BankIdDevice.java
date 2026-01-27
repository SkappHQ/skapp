package com.skapp.enterprise.esignature.eid.bankid.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Device information from BankID completion data.
 *
 * <p>
 * Contains information about the device used during the signing process.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankIdDevice {

	/**
	 * The IP address of the user's device. May be IPv4 or IPv6.
	 */
	private String ipAddress;

}
