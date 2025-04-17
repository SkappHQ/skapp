package com.skapp.enterprise.common.util;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import org.bouncycastle.jcajce.provider.digest.SHA3;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

public class HashUtil {

	private HashUtil() {
	}

	public static String hash(String data) {
		try {
			MessageDigest digest = new SHA3.Digest256(); // Using SHA-3 for strong
			// security
			byte[] hashBytes = digest.digest(data.getBytes(StandardCharsets.UTF_8));
			return Base64.getEncoder().encodeToString(hashBytes); // Encode in Base64
		}
		catch (Exception e) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_FAILED_TO_HASH,
					new String[] { e.getMessage() });
		}
	}

}
