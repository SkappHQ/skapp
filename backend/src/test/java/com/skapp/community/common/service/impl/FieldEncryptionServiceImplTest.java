package com.skapp.community.common.service.impl;

import com.skapp.community.common.service.FieldEncryptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

@DisplayName("FieldEncryptionServiceImpl (community no-op) Tests")
class FieldEncryptionServiceImplTest {

	private FieldEncryptionService service;

	@BeforeEach
	void setUp() {
		service = new FieldEncryptionServiceImpl();
	}

	@Test
	@DisplayName("Should return the value unchanged on encrypt (no-op default)")
	void encrypt_returnsValueUnchanged() {
		assertEquals("0771234567", service.encrypt("0771234567"));
		assertNull(service.encrypt(null));
	}

	@Test
	@DisplayName("Should return the value unchanged on decrypt (no-op default)")
	void decrypt_returnsValueUnchanged() {
		assertEquals("0771234567", service.decrypt("0771234567"));
		assertNull(service.decrypt(null));
	}

}
