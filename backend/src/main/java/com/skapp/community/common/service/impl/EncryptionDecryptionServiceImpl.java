package com.skapp.community.common.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.service.EncryptionDecryptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class EncryptionDecryptionServiceImpl implements EncryptionDecryptionService {

	private static final String ALGORITHM = "AES";

	private static final String TRANSFORMATION = "AES/GCM/NoPadding";

	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	private static final String SHA_VERSION = "SHA-256";

	@Value("${encryptDecryptAlgorithm.secret}")
	private String encryptSecret;

	@Override
	public String encrypt(String stringToEncrypt) {
		if (stringToEncrypt == null)
			return null;
		try {
			// 1. Generate a random 12-byte Initialization Vector (IV).
			// A unique IV per encryption ensures identical plaintexts produce
			// different ciphertexts, which is critical for AES-GCM security.
			byte[] initializationVector = new byte[12];
			SECURE_RANDOM.nextBytes(initializationVector);

			// 2. Initialize AES-GCM cipher in ENCRYPT mode using the secret key
			// and the IV. Internally, the secret key string is hashed with SHA-256
			// to derive a 256-bit AES key.
			Cipher cipher = initializeCipher(Cipher.ENCRYPT_MODE, this.encryptSecret, initializationVector);

			// 3. Encrypt the plaintext. AES-GCM appends a 128-bit authentication
			// tag to the ciphertext, which will be used during decryption to verify
			// data integrity (detect tampering).
			byte[] encryptedBytes = cipher.doFinal(stringToEncrypt.getBytes(StandardCharsets.UTF_8));

			// 4. Concatenate IV + ciphertext (which includes the auth tag) into a
			// single byte array. The IV is prepended so the decryptor can extract
			// it — the IV is not secret, but must match the one used for encryption.
			// Layout: [12-byte IV][ciphertext + 16-byte GCM auth tag]
			byte[] encryptedIvAndText = ByteBuffer.allocate(initializationVector.length + encryptedBytes.length)
				.put(initializationVector)
				.put(encryptedBytes)
				.array();

			// 5. Base64-encode the combined bytes into a safe string for DB storage
			return Base64.getEncoder().encodeToString(encryptedIvAndText);
		}
		catch (Exception exception) {
			log.error("encrypt: String encryption: {}", exception.getMessage());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ENCRYPTION_FAILED);
		}
	}

	@Override
	public String decrypt(String stringToDecrypt) {
		if (stringToDecrypt == null)
			return null;
		try {
			// 1. Base64-decode the stored string back into raw bytes.
			// The result contains: [12-byte IV][ciphertext + 16-byte GCM auth tag]
			byte[] decodedMessage = Base64.getDecoder().decode(stringToDecrypt);

			// 2. Split the byte array: extract the first 12 bytes as the IV,
			// and the remaining bytes as the encrypted payload (ciphertext + auth tag).
			ByteBuffer byteBuffer = ByteBuffer.wrap(decodedMessage);
			byte[] initializationVector = new byte[12];
			byteBuffer.get(initializationVector);
			byte[] encryptedBytes = new byte[byteBuffer.remaining()];
			byteBuffer.get(encryptedBytes);

			// 3. Initialize AES-GCM cipher in DECRYPT mode with the same secret
			// key and the extracted IV.
			Cipher cipher = initializeCipher(Cipher.DECRYPT_MODE, this.encryptSecret, initializationVector);

			// 4. Decrypt and verify integrity. AES-GCM automatically validates the
			// authentication tag — if the data was tampered with, this throws an
			// AEADBadTagException.
			byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
			return new String(decryptedBytes, StandardCharsets.UTF_8);
		}
		catch (Exception exception) {
			log.error("decrypt: String decryption: {}", exception.getMessage());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_DECRYPTION_FAILED);
		}
	}

	/**
	 * Generates a SecretKey by hashing the provided secret key string using SHA-256 and
	 * wrapping the result in an AES SecretKeySpec.
	 * @param secretKey the raw secret key string to derive the AES key from
	 * @return the generated AES SecretKey
	 */
	private SecretKey generateSecureKey(String secretKey) {
		try {
			byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
			MessageDigest shaValue = MessageDigest.getInstance(SHA_VERSION);
			keyBytes = shaValue.digest(keyBytes);
			return new SecretKeySpec(keyBytes, ALGORITHM);
		}
		catch (Exception exception) {
			log.error("generateSecureKey: Secure key generation: {}", exception.getMessage());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ENCRYPTION_DECRYPTION_SET_KEY_FAILED);
		}
	}

	/**
	 * Initializes and returns a Cipher configured for AES/GCM encryption or decryption.
	 * @param cipherMode the cipher operation mode (e.g., Cipher.ENCRYPT_MODE or
	 * Cipher.DECRYPT_MODE)
	 * @param secretKey the raw secret key string used to derive the AES key
	 * @param initializationVector the IV (nonce) bytes for the GCM parameter spec
	 * @return the initialized Cipher instance ready for encryption or decryption
	 * @throws GeneralSecurityException if cipher initialization fails
	 */
	private Cipher initializeCipher(int cipherMode, String secretKey, byte[] initializationVector)
			throws GeneralSecurityException {
		Cipher cipher = Cipher.getInstance(TRANSFORMATION);
		GCMParameterSpec gcmParameterSpec = new GCMParameterSpec(128, initializationVector);
		cipher.init(cipherMode, generateSecureKey(secretKey), gcmParameterSpec);
		return cipher;
	}

}
