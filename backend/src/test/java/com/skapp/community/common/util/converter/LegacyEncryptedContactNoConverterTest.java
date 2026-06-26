package com.skapp.community.common.util.converter;

import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.impl.EncryptionDecryptionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;

@DisplayName("LegacyEncryptedContactNoConverter Tests")
class LegacyEncryptedContactNoConverterTest {

	private static final String TEST_SECRET = "EncryptKey123456";

	private static final String ENCRYPTED_PREFIX = "ENC:";

	private EncryptionDecryptionService encryptionDecryptionService;

	private LegacyEncryptedContactNoConverter converter;

	@BeforeEach
	void setUp() {
		encryptionDecryptionService = new EncryptionDecryptionServiceImpl();
		ReflectionTestUtils.setField(encryptionDecryptionService, "encryptSecret", TEST_SECRET);

		converter = new LegacyEncryptedContactNoConverter();
		ReflectionTestUtils.setField(LegacyEncryptedContactNoConverter.class, "encryptionDecryptionService",
				encryptionDecryptionService);
	}

	/** Reproduces the value the previous (encrypting) converter would have stored. */
	private String legacyEncrypt(String plaintext) {
		return ENCRYPTED_PREFIX + encryptionDecryptionService.encrypt(plaintext);
	}

	// --- Write: encryption is stopped going forward ---

	@Test
	@DisplayName("Should store value as plaintext without ENC: prefix on write")
	void convertToDatabaseColumn_validInput_storesPlaintextWithoutPrefix() {
		String phoneNumber = "0771234567";
		String dbValue = converter.convertToDatabaseColumn(phoneNumber);

		assertEquals(phoneNumber, dbValue);
		assertFalse(dbValue.startsWith(ENCRYPTED_PREFIX));
	}

	@Test
	@DisplayName("Should return null when writing null value")
	void convertToDatabaseColumn_nullInput_returnsNull() {
		assertNull(converter.convertToDatabaseColumn(null));
	}

	// --- Read: plaintext passthrough + legacy decrypt-on-read ---

	@Test
	@DisplayName("Should return null when reading null value")
	void convertToEntityAttribute_nullInput_returnsNull() {
		assertNull(converter.convertToEntityAttribute(null));
	}

	@Test
	@DisplayName("Should return plaintext as-is when no ENC: prefix")
	void convertToEntityAttribute_plaintextInput_returnsAsIs() {
		String plaintext = "0771234567";

		assertEquals(plaintext, converter.convertToEntityAttribute(plaintext));
	}

	@Test
	@DisplayName("Should decrypt legacy ENC: prefixed value back to original")
	void convertToEntityAttribute_legacyEncryptedInput_returnsDecryptedValue() {
		String phoneNumber = "0771234567";
		String legacyValue = legacyEncrypt(phoneNumber);

		assertEquals(phoneNumber, converter.convertToEntityAttribute(legacyValue));
	}

	@Test
	@DisplayName("Should decrypt legacy ENC: value containing a country code")
	void convertToEntityAttribute_legacyEncryptedWithCountryCode_returnsDecryptedValue() {
		String phoneNumber = "+94771234567";
		String legacyValue = legacyEncrypt(phoneNumber);

		assertEquals(phoneNumber, converter.convertToEntityAttribute(legacyValue));
	}

	// --- End-to-end: new writes round-trip as plaintext ---

	@Test
	@DisplayName("Should round-trip a new write as plaintext (no encryption going forward)")
	void roundTrip_newWrite_staysPlaintext() {
		String phoneNumber = "0771234567";
		String dbValue = converter.convertToDatabaseColumn(phoneNumber);

		assertEquals(phoneNumber, dbValue);
		assertEquals(phoneNumber, converter.convertToEntityAttribute(dbValue));
	}

}
