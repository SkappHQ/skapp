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
@Table(name = "guest_user_otp")
public class GuestUserOtp {

	@Id
	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "otp_code")
	private String otpCode;

	@Column(name = "is_verified")
	private boolean isVerified;

	@Column(name = "otp_expiry_time")
	private Instant otpExpiryTime;

}
