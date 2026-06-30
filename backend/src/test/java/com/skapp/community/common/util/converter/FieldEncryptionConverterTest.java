package com.skapp.community.common.util.converter;

import com.skapp.community.common.service.FieldEncryptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DisplayName("FieldEncryptionConverter Tests")
@ExtendWith(MockitoExtension.class)
class FieldEncryptionConverterTest {

	@Mock
	private FieldEncryptionService fieldEncryptionService;

	private FieldEncryptionConverter converter;

	@BeforeEach
	void setUp() {
		converter = new FieldEncryptionConverter();
		converter.setFieldEncryptionService(fieldEncryptionService);
	}

	@Test
	@DisplayName("Should delegate null to the service when encrypting (service owns null handling)")
	void convertToDatabaseColumn_nullInput_delegatesNullToService() {
		assertNull(converter.convertToDatabaseColumn(null));
		verify(fieldEncryptionService).encrypt(null);
	}

	@Test
	@DisplayName("Should delegate null to the service when decrypting (service owns null handling)")
	void convertToEntityAttribute_nullInput_delegatesNullToService() {
		assertNull(converter.convertToEntityAttribute(null));
		verify(fieldEncryptionService).decrypt(null);
	}

	@Test
	@DisplayName("Should delegate non-null encryption to the service")
	void convertToDatabaseColumn_delegatesToService() {
		when(fieldEncryptionService.encrypt("0771234567")).thenReturn("ENC:1:cipher");

		assertEquals("ENC:1:cipher", converter.convertToDatabaseColumn("0771234567"));
		verify(fieldEncryptionService).encrypt("0771234567");
	}

	@Test
	@DisplayName("Should delegate non-null decryption to the service")
	void convertToEntityAttribute_delegatesToService() {
		when(fieldEncryptionService.decrypt("ENC:1:cipher")).thenReturn("0771234567");

		assertEquals("0771234567", converter.convertToEntityAttribute("ENC:1:cipher"));
		verify(fieldEncryptionService).decrypt("ENC:1:cipher");
		verify(fieldEncryptionService, never()).encrypt(org.mockito.ArgumentMatchers.anyString());
	}

}
