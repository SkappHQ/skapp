package com.skapp.community.common.util.converter;

import com.skapp.community.common.service.EncryptionDecryptionService;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * JPA AttributeConverter that transparently encrypts String fields before persisting to
 * the database and decrypts them when reading back. Uses AES-GCM encryption via
 * {@link EncryptionDecryptionService}.
 *
 * <p>
 * Encrypted values are stored with an "ENC:" prefix which serves two purposes: (1)
 * backward compatibility — allows plaintext data to coexist with encrypted data during
 * migration, and (2) permanent identification — makes it easy to verify encryption status
 * by inspecting stored data directly at the database level.
 * </p>
 *
 * <p>
 * Usage: Add {@code @Convert(converter = EncryptionDecryptionConverter.class)} to any
 * entity String field that needs encryption at rest.
 * </p>
 */
@Converter
@Component
public class EncryptionDecryptionConverter implements AttributeConverter<String, String> {

	// Prefix to identify encrypted values in the database. Values without this
	// prefix are treated as plaintext (pre-migration data).
	private static final String ENCRYPTED_PREFIX = "ENC:";

	private static EncryptionDecryptionService encryptionDecryptionService;

	@Autowired
	public void setEncryptionDecryptionService(EncryptionDecryptionService encryptionDecryptionService) {
		EncryptionDecryptionConverter.encryptionDecryptionService = encryptionDecryptionService;
	}

	/**
	 * Encrypts the attribute value and prepends the "ENC:" prefix before storing in DB.
	 * DB value format: "ENC:" + Base64(IV + AES-GCM ciphertext + auth tag)
	 */
	@Override
	public String convertToDatabaseColumn(String attribute) {
		if (attribute == null) {
			return null;
		}
		return ENCRYPTED_PREFIX + encryptionDecryptionService.encrypt(attribute);
	}

	/**
	 * Decrypts the DB value if it has the "ENC:" prefix. Returns plaintext as-is for
	 * backward compatibility with pre-migration data. The "ENC:" prefix also serves as a
	 * permanent marker to identify encrypted values at the database level, making it easy
	 * to verify encryption status by inspecting the stored data directly.
	 */
	@Override
	public String convertToEntityAttribute(String dbData) {
		if (dbData == null) {
			return null;
		}
		if (dbData.startsWith(ENCRYPTED_PREFIX)) {
			return encryptionDecryptionService.decrypt(dbData.substring(ENCRYPTED_PREFIX.length()));
		}
		// Plaintext data — not yet encrypted
		return dbData;
	}

}
