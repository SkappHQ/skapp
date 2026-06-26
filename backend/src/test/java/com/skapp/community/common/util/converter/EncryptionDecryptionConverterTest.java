package com.skapp.community.common.util.converter;

import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.impl.EncryptionDecryptionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("EncryptionDecryptionConverter Tests")
class EncryptionDecryptionConverterTest {

	private static final String TEST_SECRET = "EncryptKey123456";

	private EncryptionDecryptionConverter converter;

	@BeforeEach
	void setUp() {
		EncryptionDecryptionService encryptionDecryptionService = new EncryptionDecryptionServiceImpl();
		ReflectionTestUtils.setField(encryptionDecryptionService, "encryptSecret", TEST_SECRET);

		converter = new EncryptionDecryptionConverter();
		ReflectionTestUtils.setField(EncryptionDecryptionConverter.class, "encryptionDecryptionService",
				encryptionDecryptionService);
	}

	@Test
	@DisplayName("Should return null when encrypting null value")
	void convertToDatabaseColumn_nullInput_returnsNull() {
		assertNull(converter.convertToDatabaseColumn(null));
	}

	@Test
	@DisplayName("Should return null when decrypting null value")
	void convertToEntityAttribute_nullInput_returnsNull() {
		assertNull(converter.convertToEntityAttribute(null));
	}

	@Test
	@DisplayName("Should encrypt value with ENC: prefix")
	void convertToDatabaseColumn_validInput_returnsEncryptedWithPrefix() {
		String phoneNumber = "0771234567";
		String dbValue = converter.convertToDatabaseColumn(phoneNumber);

		assertTrue(dbValue.startsWith("ENC:"));
	}

	@Test
	@DisplayName("Should decrypt ENC: prefixed value back to original")
	void convertToEntityAttribute_encryptedInput_returnsDecryptedValue() {
		String phoneNumber = "0771234567";
		String dbValue = converter.convertToDatabaseColumn(phoneNumber);
		String decrypted = converter.convertToEntityAttribute(dbValue);

		assertEquals(phoneNumber, decrypted);
	}

	@Test
	@DisplayName("Should return plaintext as-is when no ENC: prefix (pre-migration data)")
	void convertToEntityAttribute_plaintextInput_returnsAsIs() {
		String plaintext = "0771234567";
		String result = converter.convertToEntityAttribute(plaintext);

		assertEquals(plaintext, result);
	}

	@Test
	@DisplayName("Should produce different ciphertext for same input (random IV)")
	void convertToDatabaseColumn_sameInput_producesDifferentCiphertext() {
		String phoneNumber = "0771234567";
		String encrypted1 = converter.convertToDatabaseColumn(phoneNumber);
		String encrypted2 = converter.convertToDatabaseColumn(phoneNumber);

		assertTrue(encrypted1.startsWith("ENC:"));
		assertTrue(encrypted2.startsWith("ENC:"));
		// AES-GCM with random IV should produce different ciphertext each time
		assertNotEquals(encrypted1, encrypted2);
	}

	@Test
	@DisplayName("Should handle phone number with country code")
	void convertToDatabaseColumn_phoneWithCountryCode_encryptsAndDecrypts() {
		String phoneNumber = "+94771234567";
		String dbValue = converter.convertToDatabaseColumn(phoneNumber);
		String decrypted = converter.convertToEntityAttribute(dbValue);

		assertEquals(phoneNumber, decrypted);
	}

	@Test
	@DisplayName("Should handle empty string")
	void convertToDatabaseColumn_emptyString_encryptsAndDecrypts() {
		String empty = "";
		String dbValue = converter.convertToDatabaseColumn(empty);
		String decrypted = converter.convertToEntityAttribute(dbValue);

		assertEquals(empty, decrypted);
	}

}
