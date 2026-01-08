package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "es_recipient_verification_session")
public class EsignVerificationSession extends Auditable<String> {

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

	@Column(name = "otp_created_time")
	private Instant otpCreatedTime;

	@Column(name = "concurrent_access_count")
	private int concurrentAccessCount;

	@Column(name = "attempt_count")
	private int attemptCount;

	@Column(name = "resend_count")
	private int resendCount;

	@Column(name = "last_attempt_at")
	private Instant lastAttemptedTime;

	@Column(name = "daily_otp_count")
	private int dailyOtpCount = 0;

	@Column(name = "daily_count_reset_time")
	private Instant dailyCountResetTime;

	@Column(name = "lockout_level")
	private int lockoutLevel = 0;

	@Column(name = "lockout_level_reset_time")
	private Instant lockoutLevelResetTime;

	@Column(name = "verification_lockout_level")
	private int verificationLockoutLevel = 0;

	@Column(name = "verification_lockout_reset_time")
	private Instant verificationLockoutResetTime;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "recipient_id")
	private Recipient recipient;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "document_id")
	private Document document;

}
