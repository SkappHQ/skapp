package com.skapp.enterprise.esignature.util;

import lombok.Data;

/**
 * ThreadLocal context for request-scoped audit information.
 * Captures user-agent from HTTP request and makes it available throughout the request lifecycle.
 */
public class AuditRequestContext {

	private static final ThreadLocal<AuditContext> context = new ThreadLocal<>();

	public static AuditContext get() {
		return context.get();
	}

	public static void set(String userAgent) {
		AuditContext auditContext = new AuditContext();
		auditContext.setUserAgent(userAgent);
		context.set(auditContext);
	}

	public static void clear() {
		context.remove();
	}

	@Data
	public static class AuditContext {

		private String userAgent;
		// Can add authMethod here later if needed

	}

}
