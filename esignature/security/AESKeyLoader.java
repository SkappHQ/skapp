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
	private char[] aesSecretKey;

	private static final int[] VALID_KEY_SIZES = { 16, 24, 32 }; // Valid AES key sizes in
																	// bytes

	public SecretKey getAESKeyFromEnv() {
		if (aesSecretKey == null || aesSecretKey.length == 0) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_AES_KEY_NOT_FOUND);
		}

		try {
			// Convert char[] directly to byte[] for Base64 decoding
			java.nio.ByteBuffer byteBuffer = java.nio.charset.StandardCharsets.UTF_8.encode(java.nio.CharBuffer.wrap(aesSecretKey));
			byte[] keyBytes = new byte[byteBuffer.remaining()];
			byteBuffer.get(keyBytes);
			keyBytes = Base64.getDecoder().decode(keyBytes);

			// Validate key size
			boolean validKeySize = false;
			for (int size : VALID_KEY_SIZES) {
				if (keyBytes.length == size) {
					validKeySize = true;
					break;
				}
			}

			if (!validKeySize) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_AES_KEY_SIZE);
			}

			SecretKey key = new SecretKeySpec(keyBytes, "AES");

			// Zero out sensitive data
			java.util.Arrays.fill(keyBytes, (byte) 0);

			return key;
		}
		catch (IllegalArgumentException e) {
			// Base64 decoding failed
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_AES_KEY_FORMAT);
		}
	}

}