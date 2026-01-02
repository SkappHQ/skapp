package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "es_recipient_verification")
public class EsignVerification extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "verification_code")
	private String verificationCode;

	@Column(name = "is_verified")
	private boolean verified;

	@Column(name = "otp_expiry_time")
	private Instant otpExpiryTime;

	@Column(name = "attempt_count")
	private int otpSentAttemptCount;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "recipient_id")
	private Recipient recipient;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "document_id")
	private Document document;

}
