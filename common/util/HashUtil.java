package com.skapp.enterprise.common.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import org.bouncycastle.jcajce.provider.digest.SHA3;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HexFormat;

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
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_FAILED_TO_HASH,
					new String[] { e.getMessage() });
		}
	}

	public static String hashSha256Hex(String data) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hashBytes = digest.digest(data.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(hashBytes);
		}
		catch (NoSuchAlgorithmException e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_FAILED_TO_HASH,
					new String[] { e.getMessage() });
		}
	}

}
