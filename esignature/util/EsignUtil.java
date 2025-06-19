package com.skapp.enterprise.esignature.util;

import jakarta.servlet.http.HttpServletRequest;

import java.time.Instant;
import java.util.UUID;

public class EsignUtil {

	private static final String FILE_PREFIX = "processed_";

	private static final String HEADER_X_FORWARDED_FOR = "X-Forwarded-For";

	private static final String HEADER_CF_CONNECTING_IP = "CF-Connecting-IP";

	private static final String HEADER_CF_CONNECTING_IPV6 = "CF-Connecting-IPv6";

	private static final String HEADER_X_REAL_IP = "X-Real-IP";

	private static final String UNKNOWN = "unknown";

	private EsignUtil() {
	}

	public static String randomUrlPath() {
		return FILE_PREFIX + UUID.randomUUID() + ".pdf";
	}

	public static String getClientIp(HttpServletRequest request) {
		String[] headers = { HEADER_CF_CONNECTING_IP, HEADER_CF_CONNECTING_IPV6, HEADER_X_FORWARDED_FOR,
				HEADER_X_REAL_IP };

		for (String header : headers) {
			String ip = request.getHeader(header);
			if (ip != null && !ip.isEmpty() && !UNKNOWN.equalsIgnoreCase(ip)) {
				// For HEADER_X_FORWARDED_FOR, return the first IP in the list
				return header.equals(HEADER_X_FORWARDED_FOR) ? ip.split(",")[0].trim() : ip;
			}
		}

		return request.getRemoteAddr(); // Fallback to direct IP
	}

	public static String generateTimestampUUID() {
		UUID generatedUUID = UUID.randomUUID();

		Instant now = Instant.now();
		long epochMillis = now.toEpochMilli();

		return generatedUUID + "_" + epochMillis;
	}

}
