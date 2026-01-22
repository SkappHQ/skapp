package com.skapp.enterprise.esignature.eid;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;

/**
 * Utility class for generating BankID animated QR codes.
 *
 * BankID QR codes are "animated" - they change every second to prevent replay attacks.
 * The QR code format is: bankid.{qrStartToken}.{time}.{qrAuthCode} where qrAuthCode =
 * HMAC_SHA256(qrStartSecret, time)
 *
 * @see <a href="https://developers.bankid.com/how-to-guides/qr-code">BankID QR Code
 * Guide</a>
 */
@Slf4j
public final class BankIdQrCodeUtil {

	private static final String HMAC_SHA256 = "HmacSHA256";

	private static final String QR_FORMAT = "bankid.%s.%d.%s";

	private BankIdQrCodeUtil() {
		// Utility class
	}

	/**
	 * Computes the BankID QR code string for the given session.
	 * @param qrStartToken The QR start token from BankID /sign or /auth response
	 * @param qrStartSecret The QR start secret from BankID response
	 * @param initiatedAt When the session was initiated (for computing elapsed time)
	 * @return The QR code string to be encoded, or null if computation fails
	 */
	public static String computeQrCode(String qrStartToken, String qrStartSecret, Instant initiatedAt) {
		if (qrStartToken == null || qrStartSecret == null || initiatedAt == null) {
			return null;
		}

		long elapsedSeconds = Duration.between(initiatedAt, Instant.now()).getSeconds();
		if (elapsedSeconds < 0) {
			elapsedSeconds = 0;
		}

		String qrAuthCode = computeHmacSha256(qrStartSecret, String.valueOf(elapsedSeconds));
		if (qrAuthCode == null) {
			return null;
		}

		return String.format(QR_FORMAT, qrStartToken, elapsedSeconds, qrAuthCode);
	}

	/**
	 * Computes the BankID QR code string from provider data JSON.
	 * @param providerData JSON node containing qrStartToken and qrStartSecret
	 * @param initiatedAt When the session was initiated
	 * @return The QR code string, or null if required fields are missing
	 */
	public static String computeQrCode(JsonNode providerData, Instant initiatedAt) {
		if (providerData == null || initiatedAt == null) {
			return null;
		}

		String qrStartToken = getJsonField(providerData, "qrStartToken");
		String qrStartSecret = getJsonField(providerData, "qrStartSecret");

		return computeQrCode(qrStartToken, qrStartSecret, initiatedAt);
	}

	/**
	 * Computes HMAC-SHA256 of the data using the secret key.
	 * @param secret The secret key
	 * @param data The data to sign
	 * @return Lowercase hex string of the HMAC, or null on error
	 */
	private static String computeHmacSha256(String secret, String data) {
		try {
			Mac mac = Mac.getInstance(HMAC_SHA256);
			SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
			mac.init(keySpec);
			byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
			return bytesToHex(hmacBytes);
		}
		catch (NoSuchAlgorithmException | InvalidKeyException e) {
			log.error("Failed to compute HMAC-SHA256 for BankID QR code", e);
			return null;
		}
	}

	/**
	 * Converts byte array to lowercase hex string.
	 */
	private static String bytesToHex(byte[] bytes) {
		StringBuilder sb = new StringBuilder(bytes.length * 2);
		for (byte b : bytes) {
			sb.append(String.format("%02x", b));
		}
		return sb.toString();
	}

	/**
	 * Safely extracts a string field from a JSON node.
	 */
	private static String getJsonField(JsonNode node, String fieldName) {
		if (node == null || !node.has(fieldName) || node.get(fieldName).isNull()) {
			return null;
		}
		return node.get(fieldName).asText();
	}

}
