package com.skapp.community.common.util.converter;

import com.skapp.community.common.service.EncryptionDecryptionService;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Transitional JPA converter for organization {@code contact_no}: writes plaintext
 * (encryption is stopped going forward) and decrypts legacy {@code "ENC:"}-prefixed
 * values on read. Removable once the skapp-migrations revert has converted every stored
 * value back to plaintext.
 */
@Converter
@Component
public class LegacyEncryptedContactNoConverter implements AttributeConverter<String, String> {

	// Prefix that marks values written by the previous (encrypting) converter.
	private static final String ENCRYPTED_PREFIX = "ENC:";

	private static EncryptionDecryptionService encryptionDecryptionService;

	// Hibernate creates this converter itself (not Spring), so constructor args can't be
	// injected — we use a static @Autowired setter instead.
	@Autowired
	public void setEncryptionDecryptionService(EncryptionDecryptionService encryptionDecryptionService) {
		LegacyEncryptedContactNoConverter.encryptionDecryptionService = encryptionDecryptionService;
	}

	/**
	 * Stores the value as plaintext. Encryption is intentionally no longer performed, so
	 * all future writes persist a plain contact number.
	 */
	@Override
	public String convertToDatabaseColumn(String attribute) {
		return attribute;
	}

	/**
	 * Returns plaintext values as-is and decrypts legacy values that still carry the
	 * "ENC:" prefix, so the application keeps reading correct values until the data
	 * migration has converted every stored value back to plaintext.
	 */
	@Override
	public String convertToEntityAttribute(String dbData) {
		if (dbData != null && dbData.startsWith(ENCRYPTED_PREFIX)) {
			return encryptionDecryptionService.decrypt(dbData.substring(ENCRYPTED_PREFIX.length()));
		}
		return dbData;
	}

}
