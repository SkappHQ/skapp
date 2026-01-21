package com.skapp.enterprise.esignature.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.skapp.community.common.model.Auditable;
import com.skapp.community.common.util.converter.JsonTypeConverter;
import com.skapp.enterprise.esignature.type.EidProviderType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Entity storing verified identity information from eID providers. This captures the
 * identity data returned after successful verification (e.g., name, personal number from
 * BankID).
 * <p>
 * The personal number is encrypted at rest for GDPR compliance.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "es_verified_identity")
public class VerifiedIdentity extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "session_id", nullable = false)
	private EidVerificationSession session;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "recipient_id", nullable = false)
	private Recipient recipient;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "document_id", nullable = false)
	private Document document;

	@Enumerated(EnumType.STRING)
	@Column(name = "provider_type", nullable = false, length = 50)
	private EidProviderType providerType;

	@Column(name = "full_name", nullable = false, length = 255)
	private String fullName;

	@Column(name = "given_name", length = 100)
	private String givenName;

	@Column(name = "surname", length = 100)
	private String surname;

	/**
	 * Encrypted personal number (e.g., Swedish personnummer). AES-256 encrypted for GDPR
	 * compliance.
	 */
	@Column(name = "personal_number_encrypted")
	private byte[] personalNumberEncrypted;

	/**
	 * SHA-256 hash of personal number for lookups without decryption.
	 */
	@Column(name = "personal_number_hash", length = 64)
	private String personalNumberHash;

	/**
	 * IP address of the device used for verification.
	 */
	@Column(name = "device_ip", length = 45)
	private String deviceIp;

	@Column(name = "verified_at", nullable = false)
	private Instant verifiedAt;

	/**
	 * BankID XML signature (Base64 encoded). This cryptographically proves the user
	 * signed the document.
	 */
	@Lob
	@Column(name = "signature_data")
	private String signatureData;

	/**
	 * OCSP response (Base64 encoded). Proves the certificate was valid at signing time.
	 */
	@Lob
	@Column(name = "ocsp_response")
	private String ocspResponse;

	/**
	 * Additional certificate information stored as JSON.
	 */
	@Convert(converter = JsonTypeConverter.class)
	@Column(name = "certificate_info", columnDefinition = "json")
	private JsonNode certificateInfo;

}
