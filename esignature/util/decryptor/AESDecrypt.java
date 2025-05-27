package com.skapp.enterprise.esignature.util.decryptor;

import com.skapp.community.common.constant.EncryptionDecryptionAlgorithmConstants;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.util.Base64;

public class AESDecrypt {

	private static final int TAG_LENGTH = 128;

	private static final int IV_LENGTH_VALIDATE = 16;

	private AESDecrypt() {
	}

	public static byte[] decryptAES(String encryptedPrivateKeyBase64, SecretKey aesKey, byte[] iv) {
		if (encryptedPrivateKeyBase64 == null || aesKey == null || iv == null || iv.length != IV_LENGTH_VALIDATE) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_PRIVATE_KEY_DECRYPTION, null);
		}

		try {
			byte[] encryptedPrivateKey = Base64.getDecoder().decode(encryptedPrivateKeyBase64);

			Cipher cipher = Cipher.getInstance(EncryptionDecryptionAlgorithmConstants.TRANSFORMATION);
			GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH, iv);
			cipher.init(Cipher.DECRYPT_MODE, aesKey, gcmSpec);

			return cipher.doFinal(encryptedPrivateKey);
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_PRIVATE_KEY_DECRYPTION, null);
		}
	}

}