package com.skapp.enterprise.esignature.utill.encryptor;

import com.skapp.community.common.constant.EncryptionDecryptionAlgorithmConstants;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.security.PrivateKey;
import java.util.Base64;

public class AESEncrypt {

	private static final int TAG_LENGTH = 128;

	private AESEncrypt() {
	}

	public static String encryptPrivateKey(PrivateKey privateKey, SecretKey aesKey, byte[] iv) {
		try {
			byte[] privateKeyBytes = privateKey.getEncoded();

			Cipher cipher = Cipher.getInstance(EncryptionDecryptionAlgorithmConstants.TRANSFORMATION);
			GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH, iv);
			cipher.init(Cipher.ENCRYPT_MODE, aesKey, gcmSpec);

			byte[] encryptedData = cipher.doFinal(privateKeyBytes);

			return Base64.getEncoder().encodeToString(encryptedData);

		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_PRIVATE_KEY_ENCRYPTION,
					new String[] { e.getMessage() });
		}
	}

}
