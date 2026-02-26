package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.enterprise.esignature.type.EidProviderType;
import com.skapp.enterprise.esignature.type.EidVerificationStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
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
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing an eID verification session. This is used for identity verification
 * during document signing (e.g., Swedish BankID).
 * <p>
 * Note: This is separate from SMS MFA which is for document access control. eID
 * verification provides cryptographic binding between the signer's identity and the
 * document.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "es_eid_verification_session")
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
	 * IP address of the end user initiating the verification.
	 */
	@Column(name = "end_user_ip", length = 45)
	private String endUserIp;

	/**
	 * SHA-256 hash of the document being signed. This creates cryptographic binding
	 * between the signature and the specific document version.
	 */
	@Column(name = "document_hash", nullable = false, length = 64)
	private String documentHash;

	/**
	 * Text displayed to the user in the eID app (e.g., "I agree to sign document X").
	 */
	@Lob
	@Column(name = "user_visible_data")
	private String userVisibleData;

	@CreationTimestamp
	@Column(name = "initiated_at", nullable = false, updatable = false)
	private Instant initiatedAt;

	@Column(name = "expires_at")
	private Instant expiresAt;

	@Column(name = "completed_at")
	private Instant completedAt;

	@Column(name = "error_code", length = 50)
	private String errorCode;

	@Column(name = "error_message", length = 500)
	private String errorMessage;

	/**
	 * BankID QR start token - used together with qrStartSecret to generate dynamic QR
	 * codes. Cleared when session reaches a terminal state.
	 */
	@Column(name = "qr_start_token", length = 255)
	private String qrStartToken;

	/**
	 * BankID QR start secret - used to generate dynamic QR codes. Per BankID
	 * documentation, this must remain server-side only.
	 */
	@Column(name = "qr_start_secret", length = 255)
	private String qrStartSecret;

	/**
	 * BankID auto-start token - used for same-device launch (bankid:// URL scheme).
	 * Cleared when session reaches a terminal state.
	 */
	@Column(name = "auto_start_token", length = 255)
	private String autoStartToken;

	/**
	 * BankID hint code - updated on each poll to provide status messages (e.g.,
	 * "outstandingTransaction", "userSign"). Cleared when session reaches a terminal
	 * state.
	 */
	@Column(name = "hint_code", length = 50)
	private String hintCode;

	@OneToOne(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private VerifiedIdentity verifiedIdentity;

	@PrePersist
	protected void onCreate() {
		if (sessionUuid == null) {
			sessionUuid = UUID.randomUUID().toString();
		}
	}

}
