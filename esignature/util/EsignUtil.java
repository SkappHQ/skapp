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

	private static final String PATH_ATTR = "; Path=";

	private static final String DOMAIN_ATTR = "; Domain=";

	private static final String SECURE_ATTR = "; Secure";

	private static final String HTTP_ONLY_ATTR = "; HttpOnly";

	private static final String MAX_AGE_ATTR = "; Max-Age=";

	private static final String SAME_SITE_ATTR = "; SameSite=Lax";

	private static final String DEFAULT_PATH = "/";

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

	public static String buildSetCookieHeader(String nameValue, int maxAge, String domain, String path) {
		String[] parts = nameValue.split("=", 2);
		String name = parts[0];
		String value = parts.length > 1 ? parts[1] : "";

		StringBuilder sb = new StringBuilder();
		sb.append(name).append("=").append(value);

		if (path != null && !path.isEmpty()) {
			sb.append(PATH_ATTR).append(path);
		}
		else {
			sb.append(PATH_ATTR).append(DEFAULT_PATH);
		}

		if (domain != null && !domain.isEmpty()) {
			sb.append(DOMAIN_ATTR).append(domain);
		}

		sb.append(SECURE_ATTR);
		sb.append(HTTP_ONLY_ATTR);

		if (maxAge > 0) {
			sb.append(MAX_AGE_ATTR).append(maxAge);
		}

		sb.append(SAME_SITE_ATTR);

		return sb.toString();
	}

}
