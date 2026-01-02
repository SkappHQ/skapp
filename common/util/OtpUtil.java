package com.skapp.enterprise.common.util;

import lombok.experimental.UtilityClass;

import java.security.SecureRandom;
import java.time.Instant;

@UtilityClass
public class OtpUtil {

	private final SecureRandom secureRandom = new SecureRandom();

	public static String generateOTP() {
		return String.format("%04d", secureRandom.nextInt(9999));
	}

	public static boolean validateOTP(String storedOTP, Instant expiryTime, String providedOTP) {
		if (storedOTP == null || expiryTime == null) {
			return true;
		}

		if (Instant.now().isAfter(expiryTime)) {
			return true;
		}

		return !storedOTP.equals(providedOTP);
	}

}
