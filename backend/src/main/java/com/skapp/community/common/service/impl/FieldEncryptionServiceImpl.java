package com.skapp.community.common.service.impl;

import com.skapp.community.common.service.FieldEncryptionService;
import org.springframework.stereotype.Service;

/**
 * Default community {@link FieldEncryptionService}: a no-op that stores and reads values
 * as plain text. Field-level encryption is an enterprise capability (KMS-backed envelope
 * encryption); community builds carry no key material, so the safe default is to leave
 * the value untouched.
 *
 * <p>
 * The enterprise module overrides this with a {@code @Primary} KMS-backed implementation
 * ({@code EpFieldEncryptionServiceImpl}), the same way other enterprise services override
 * their community defaults.
 * </p>
 */
@Service
public class FieldEncryptionServiceImpl implements FieldEncryptionService {

	@Override
	public String encrypt(String plaintext) {
		return plaintext;
	}

	@Override
	public String decrypt(String dbValue) {
		return dbValue;
	}

}
