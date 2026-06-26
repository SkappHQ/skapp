package com.skapp.community.common.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DisplayName("EncryptionDecryptionServiceImpl Tests")
class EncryptionDecryptionServiceImplTest {

	private static final String TEST_SECRET = "EncryptKey123456";

	private EncryptionDecryptionServiceImpl service;

	@BeforeEach
	void setUp() {
		service = new EncryptionDecryptionServiceImpl();
		ReflectionTestUtils.setField(service, "encryptSecret", TEST_SECRET);
	}

	// ==================== encrypt() tests ====================

	@Test
	@DisplayName("Should return null when encrypting null input")
	void encrypt_nullInput_returnsNull() {
		assertNull(service.encrypt(null));
	}

	@Test
	@DisplayName("Should return non-null encrypted string for valid input")
	void encrypt_validInput_returnsEncryptedString() {
		String encrypted = service.encrypt("hello");

		assertNotNull(encrypted);
	}

	@Test
	@DisplayName("Should produce different ciphertext for same plaintext (random IV)")
	void encrypt_sameInput_producesDifferentCiphertext() {
		String encrypted1 = service.encrypt("hello");
		String encrypted2 = service.encrypt("hello");

		assertNotEquals(encrypted1, encrypted2);
	}

	// ==================== decrypt() tests ====================

	@Test
	@DisplayName("Should return null when decrypting null input")
	void decrypt_nullInput_returnsNull() {
		assertNull(service.decrypt(null));
	}

	@Test
	@DisplayName("Should decrypt back to original plaintext")
	void decrypt_validEncryptedInput_returnsOriginalPlaintext() {
		String original = "sensitive data";
		String encrypted = service.encrypt(original);
		String decrypted = service.decrypt(encrypted);

		assertEquals(original, decrypted);
	}

	@Test
	@DisplayName("Should throw exception when decrypting invalid Base64 data")
	void decrypt_invalidData_throwsException() {
		assertThrows(RuntimeException.class, () -> service.decrypt("not-valid-encrypted-data"));
	}

	// ==================== round-trip tests ====================

	@Test
	@DisplayName("Should handle empty string encrypt and decrypt")
	void roundTrip_emptyString_encryptsAndDecrypts() {
		String original = "";
		String encrypted = service.encrypt(original);
		String decrypted = service.decrypt(encrypted);

		assertEquals(original, decrypted);
	}

	@Test
	@DisplayName("Should handle long string encrypt and decrypt")
	void roundTrip_longString_encryptsAndDecrypts() {
		String original = "A".repeat(10000);
		String encrypted = service.encrypt(original);
		String decrypted = service.decrypt(encrypted);

		assertEquals(original, decrypted);
	}

	@Test
	@DisplayName("Should handle special characters encrypt and decrypt")
	void roundTrip_specialCharacters_encryptsAndDecrypts() {
		String original = "héllo wörld! @#$%^&*() 日本語 🔐";
		String encrypted = service.encrypt(original);
		String decrypted = service.decrypt(encrypted);

		assertEquals(original, decrypted);
	}

}
