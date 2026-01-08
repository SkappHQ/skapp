package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.enterprise.esignature.type.EsignVerificationEventType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "es_recipient_verification_history_log")
public class EsignVerificationSessionLog extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "recipient_id", nullable = false, updatable = false)
	private Long recipientId;

	@Column(name = "document_id", nullable = false, updatable = false)
	private Long documentId;

	@Column(name = "event_type")
	@Enumerated(EnumType.STRING)
	private EsignVerificationEventType eventType;

	@Column(name = "timestamp")
	private Instant timestamp;

	@Column(name = "concurrent_access_count")
	private int concurrentAccessCount;

	@Column(name = "attempt_number")
	private int attemptNumber;

	@Column(name = "resend_number")
	private int resendNumber;

}
