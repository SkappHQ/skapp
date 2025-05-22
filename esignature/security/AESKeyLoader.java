package com.skapp.enterprise.esignature.security;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Component
public class AESKeyLoader {

	@Value("${esign.private-key.aes-secret-key}")
	private char[] aesSecretKey; // Using char[] instead of String for better security:
									// 1. Can be explicitly cleared from memory
									// 2. Avoids String pool retention of sensitive data
									// 3. Follows security best practices for credential
									// handling

	private static final int[] VALID_KEY_SIZES = { 16, 24, 32 }; // Valid AES key sizes in
																	// bytes

	public SecretKey getAESKeyFromEnv() {
		// Check if the AES secret key is missing or empty
		if (aesSecretKey == null || aesSecretKey.length == 0) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_AES_KEY_NOT_FOUND);
		}

		try {
			// Convert the char[] AES key to a ByteBuffer using UTF-8 encoding
			java.nio.ByteBuffer byteBuffer = java.nio.charset.StandardCharsets.UTF_8
				.encode(java.nio.CharBuffer.wrap(aesSecretKey));
			// Create a byte[] from the ByteBuffer
			byte[] keyBytes = new byte[byteBuffer.remaining()]; // Checks how many bytes
																// are in the buffer using
																// byteBuffer.remaining()
																// Creates a new byte
																// array with that exact
																// size
			// This ensures the array is the perfect size - not too large (wasting memory)
			// and not too small (which would truncate data)
			byteBuffer.get(keyBytes);
			// Decode the Base64-encoded key to get the raw AES key bytes
			keyBytes = Base64.getDecoder().decode(keyBytes);

			// Validate that the key length matches a valid AES key size (16, 24, or 32
			// bytes)
			boolean validKeySize = false;
			for (int size : VALID_KEY_SIZES) {
				if (keyBytes.length == size) {
					validKeySize = true;
					break;
				}
			}

			// Throw an exception if the key size is invalid
			if (!validKeySize) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_AES_KEY_SIZE);
			}

			// Create a SecretKey object from the decoded AES key bytes
			SecretKey key = new SecretKeySpec(keyBytes, "AES");

			// Overwrite the keyBytes array to remove sensitive data from memory
			java.util.Arrays.fill(keyBytes, (byte) 0);

			// Return the constructed SecretKey
			return key;
		}
		catch (IllegalArgumentException e) {
			// Handle Base64 decoding errors
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_AES_KEY_FORMAT);
		}
	}

}