package com.skapp.enterprise.esignature.utill;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import org.bouncycastle.jcajce.provider.digest.SHA256;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class HashUtil {

	private HashUtil() {
		// Private constructor to prevent instantiation
	}

	public static String generateSHA256Hash(String input) {
		try {
			MessageDigest digest = new SHA256.Digest();
			byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
			return bytesToHex(hashBytes);
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_GENERATE_AUDIT_HASH,
					new String[] { e.getMessage() });
		}
	}

	private static String bytesToHex(byte[] hashBytes) {
		StringBuilder hexString = new StringBuilder(2 * hashBytes.length);
		for (byte b : hashBytes) {
			String hex = Integer.toHexString(0xff & b);
			if (hex.length() == 1) {
				hexString.append('0');
			}
			hexString.append(hex);
		}
		return hexString.toString();
	}

}
