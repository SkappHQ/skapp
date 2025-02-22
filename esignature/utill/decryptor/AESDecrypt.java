package com.skapp.enterprise.esignature.utill.decryptor;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.util.Base64;

public class AESDecrypt {

	private static final String AES_ALGORITHM = "AES/GCM/NoPadding";

	private static final int TAG_LENGTH = 128;

	private AESDecrypt() {
	}

	public static byte[] decryptAES(String encryptedPrivateKeyBase64, SecretKey aesKey, byte[] iv) {
		try {
			byte[] encryptedPrivateKey = Base64.getDecoder().decode(encryptedPrivateKeyBase64);

			Cipher cipher = Cipher.getInstance(AES_ALGORITHM);
			GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH, iv);
			cipher.init(Cipher.DECRYPT_MODE, aesKey, gcmSpec);

			return cipher.doFinal(encryptedPrivateKey);
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_PRIVATE_KEY_DECRYPTION,
					new String[] { e.getMessage() });
		}

	}

}
