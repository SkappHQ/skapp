package com.skapp.community.common.util.converter;

import com.skapp.community.common.service.FieldEncryptionService;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * JPA {@link AttributeConverter} that transparently field-encrypts String columns at rest
 * by delegating to {@link FieldEncryptionService}.
 *
 * <p>
 * The converter holds no crypto logic of its own; the injected service owns the wire
 * format. In community builds the default service is a no-op (plaintext passthrough); in
 * enterprise builds it is the KMS-backed implementation that produces
 * {@code ENC:<alias>:<base64(IV + ciphertext + GCM tag)>}. The {@code ENC:} marker lets
 * encrypted and not-yet-backfilled plaintext data coexist on read.
 * </p>
 *
 * <p>
 * Usage: add {@code @Convert(converter = FieldEncryptionConverter.class)} to a String
 * field — only after verifying that field is not used in {@code WHERE} / {@code ORDER BY}
 * / unique constraints / joins, since random-IV GCM ciphertext is not searchable.
 * </p>
 *
 * <p>
 * JPA instantiates converters outside the Spring context, so the service is injected
 * through a static setter (the same pattern the existing
 * {@code EncryptionDecryptionConverter} uses).
 * </p>
 */
@Converter
@Component
public class FieldEncryptionConverter implements AttributeConverter<String, String> {

	private static FieldEncryptionService fieldEncryptionService;

	@Autowired
	public void setFieldEncryptionService(FieldEncryptionService fieldEncryptionService) {
		FieldEncryptionConverter.fieldEncryptionService = fieldEncryptionService;
	}

	@Override
	public String convertToDatabaseColumn(String attribute) {
		return fieldEncryptionService.encrypt(attribute);
	}

	@Override
	public String convertToEntityAttribute(String dbData) {
		return fieldEncryptionService.decrypt(dbData);
	}

}
