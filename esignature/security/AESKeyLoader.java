package com.skapp.enterprise.esignature.security;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Component
public class AESKeyLoader {

	@Value("${esign.private-key.aes-secret-key}")
	private String aesSecretKey;

	public SecretKey getAESKeyFromEnv() {
		String secretKeyBase64 = aesSecretKey;
		if (secretKeyBase64 == null || secretKeyBase64.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_AES_KEY_NOT_FOUND);
		}
		byte[] keyBytes = Base64.getDecoder().decode(secretKeyBase64);
		return new SecretKeySpec(keyBytes, "AES");
	}

}
