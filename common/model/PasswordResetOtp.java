package com.skapp.enterprise.common.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@NoArgsConstructor
@Setter
@Getter
@Table(name = "password_reset_otp")
public class PasswordResetOtp {

	@Id
	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "verification_code")
	private String verificationCode;

	@Column(name = "is_verified")
	private boolean isVerified;

	@Column(name = "otp_expiry_time")
	private Instant otpExpiryTime;

}
