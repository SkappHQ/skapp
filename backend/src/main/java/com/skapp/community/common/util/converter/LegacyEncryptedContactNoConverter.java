package com.skapp.community.common.util.converter;

import com.skapp.community.common.service.EncryptionDecryptionService;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Transitional JPA AttributeConverter for the organization {@code contact_no} field.
 *
 * <p>
 * Field-level encryption was originally applied to this field, but it has since been
 * determined that encrypting the contact number is unnecessary — the database is already
 * encrypted at rest and field-level encryption is only warranted for highly sensitive
 * data (e.g. health information). This converter reverts that decision while keeping the
 * rollout safe.
 * </p>
 *
 * <p>
 * Behaviour:
 * </p>
 * <ul>
 * <li><b>Write:</b> stores the value as plaintext — encryption is <i>stopped</i> going
 * forward.</li>
 * <li><b>Read:</b> transparently decrypts any legacy value that still carries the
 * {@code "ENC:"} prefix, and returns already-plaintext values unchanged.</li>
 * </ul>
 *
 * <p>
 * This decrypt-on-read support exists only to keep the system working for rows that were
 * encrypted before this change and before the data migration ran. Once the migration has
 * converted every stored {@code contact_no} back to plaintext, the decrypt-on-read branch
 * (and ultimately this whole converter) can be removed — see the GDPR contact-number
 * revert migration in skapp-migrations.
 * </p>
 *
 * <p>
 * See {@link EncryptionDecryptionConverter}, the generic encrypt-at-rest converter, retained
 * for fields that genuinely require field-level encryption.
 * </p>
 */
@Converter
@Component
public class LegacyEncryptedContactNoConverter implements AttributeConverter<String, String> {

	// Prefix that marks values written by the previous (encrypting) converter.
	private static final String ENCRYPTED_PREFIX = "ENC:";

	private static EncryptionDecryptionService encryptionDecryptionService;

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
		if (dbData == null) {
			return null;
		}
		if (dbData.startsWith(ENCRYPTED_PREFIX)) {
			return encryptionDecryptionService.decrypt(dbData.substring(ENCRYPTED_PREFIX.length()));
		}
		return dbData;
	}

}
