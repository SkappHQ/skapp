package com.skapp.enterprise.esignature.eid.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.skapp.community.common.util.converter.JsonTypeConverter;
import com.skapp.enterprise.esignature.eid.type.EidProviderType;
import com.skapp.enterprise.esignature.eid.type.EidVerificationEventType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Immutable audit log for eID verification events. Uses a hash chain for tamper
 * detection.
 * <p>
 * Each entry includes a hash of the current record and a reference to the previous hash,
 * creating an immutable chain that can be verified for integrity.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "es_eid_verification_audit_log")
public class EidVerificationAuditLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "session_id")
	private Long sessionId;

	@Column(name = "recipient_id")
	private Long recipientId;

	@Column(name = "document_id")
	private Long documentId;

	@Column(name = "envelope_id")
	private Long envelopeId;

	@Enumerated(EnumType.STRING)
	@Column(name = "provider_type", nullable = false, length = 50)
	private EidProviderType providerType;

	@Enumerated(EnumType.STRING)
	@Column(name = "event_type", nullable = false, length = 50)
	private EidVerificationEventType eventType;

	@Column(name = "event_timestamp", nullable = false)
	private Instant eventTimestamp;

	@Column(name = "ip_address", length = 45)
	private String ipAddress;

	@Column(name = "user_agent", length = 500)
	private String userAgent;

	/**
	 * Additional event-specific data stored as JSON.
	 */
	@Convert(converter = JsonTypeConverter.class)
	@Column(name = "event_data", columnDefinition = "json")
	private JsonNode eventData;

	/**
	 * SHA-256 hash of this record for tamper detection.
	 */
	@Column(name = "hash", nullable = false, length = 64)
	private String hash;

	/**
	 * Reference to the previous record's hash, creating a chain.
	 */
	@Column(name = "previous_hash", length = 64)
	private String previousHash;

}
