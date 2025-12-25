package com.skapp.enterprise.esignature.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Metadata about the organization's signing certificate.
 *
 * This information is used for monitoring, logging, and validation purposes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateMetadata {

	/**
	 * Certificate subject (organization name and details). Example: "CN=Skapp Inc,
	 * O=Skapp Inc, C=US"
	 */
	private String subject;

	/**
	 * Certificate issuer (CA that issued the certificate). Example: "CN=DigiCert Document
	 * Signing CA, O=DigiCert Inc, C=US"
	 */
	private String issuer;

	/**
	 * Certificate serial number (hex format). Example: "1A2B3C4D5E6F7890"
	 */
	private String serialNumber;

	/**
	 * Certificate validity start date.
	 */
	private LocalDateTime validFrom;

	/**
	 * Certificate validity end date.
	 */
	private LocalDateTime validTo;

	/**
	 * Public key algorithm (e.g., "RSA", "EC").
	 */
	private String publicKeyAlgorithm;

	/**
	 * Key size in bits (e.g., 2048, 4096 for RSA; 256, 384 for EC).
	 */
	private Integer keySize;

	/**
	 * Signature algorithm used to sign the certificate. Example: "SHA256withRSA"
	 */
	private String signatureAlgorithm;

	/**
	 * Whether this is a self-signed certificate (true for development certs).
	 */
	private Boolean selfSigned;

	/**
	 * Certificate fingerprint (SHA-256 hash).
	 */
	private String fingerprint;

}
