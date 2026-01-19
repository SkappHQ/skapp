package com.skapp.enterprise.esignature.eid.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.skapp.community.common.model.Auditable;
import com.skapp.community.common.util.converter.JsonTypeConverter;
import com.skapp.enterprise.esignature.eid.type.EidProviderType;
import com.skapp.enterprise.esignature.eid.type.EidVerificationStatus;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.Recipient;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing an eID verification session. This is used for identity verification during
 * document signing (e.g., Swedish BankID).
 * <p>
 * Note: This is separate from SMS MFA which is for document access control. eID verification
 * provides cryptographic binding between the signer's identity and the document.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "eid_verification_session")
public class EidVerificationSession extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "session_uuid", nullable = false, unique = true, length = 36)
	private String sessionUuid;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "recipient_id", nullable = false)
	private Recipient recipient;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "document_id", nullable = false)
	private Document document;

	@Enumerated(EnumType.STRING)
	@Column(name = "provider_type", nullable = false, length = 50)
	private EidProviderType providerType;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 30)
	private EidVerificationStatus status;

	/**
	 * Provider-specific session identifier (e.g., BankID orderRef).
	 */
	@Column(name = "provider_session_id", length = 255)
	private String providerSessionId;

	/**
	 * Provider-specific data stored as JSON. For BankID, this includes autoStartToken,
	 * qrStartToken, qrStartSecret, and documentHash.
	 */
	@Convert(converter = JsonTypeConverter.class)
	@Column(name = "provider_data", columnDefinition = "json")
	private JsonNode providerData;

	/**
	 * IP address of the end user initiating the verification.
	 */
	@Column(name = "end_user_ip", length = 45)
	private String endUserIp;

	/**
	 * SHA-256 hash of the document being signed. This creates cryptographic binding between the
	 * signature and the specific document version.
	 */
	@Column(name = "document_hash", nullable = false, length = 64)
	private String documentHash;

	/**
	 * Text displayed to the user in the eID app (e.g., "I agree to sign document X").
	 */
	@Lob
	@Column(name = "user_visible_data")
	private String userVisibleData;

	@Column(name = "initiated_at", nullable = false)
	private Instant initiatedAt;

	@Column(name = "expires_at")
	private Instant expiresAt;

	@Column(name = "completed_at")
	private Instant completedAt;

	@Column(name = "error_code", length = 50)
	private String errorCode;

	@Column(name = "error_message", length = 500)
	private String errorMessage;

	@OneToOne(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private VerifiedIdentity verifiedIdentity;

	@PrePersist
	protected void onCreate() {
		if (sessionUuid == null) {
			sessionUuid = UUID.randomUUID().toString();
		}
		if (initiatedAt == null) {
			initiatedAt = Instant.now();
		}
	}

}
