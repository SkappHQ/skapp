package com.skapp.enterprise.esignature.utill;

import jakarta.servlet.http.HttpServletRequest;

import java.util.UUID;

public class EsignUtil {

	private static final String FILE_PREFIX = "processed_";

	private EsignUtil() {
	}

	public static String randomUrlPath() {
		return FILE_PREFIX + UUID.randomUUID() + ".pdf";
	}

	public static String getClientIp(HttpServletRequest request) {
		String ip = request.getHeader("X-Forwarded-For");
		if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
			// First IP in the list is the original client
			return ip.split(",")[0].trim();
		}

		ip = request.getHeader("X-Real-IP");
		if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
			return ip;
		}

		return request.getRemoteAddr(); // Fallback to direct IP
	}

}
