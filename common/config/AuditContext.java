package com.skapp.enterprise.common.config;

import lombok.Data;

/**
 * ThreadLocal context for request-scoped information. Captures data from HTTP request and
 * makes it available throughout the request lifecycle. This is a generic request context
 * that can be used across all modules.
 */
public class AuditContext {

	private static final ThreadLocal<Context> context = new ThreadLocal<>();

	public static Context get() {
		return context.get();
	}

	public static void set(Context requestContext) {
		context.set(requestContext);
	}

	public static void setUserAgent(String userAgent) {
		Context requestContext = context.get();
		if (requestContext == null) {
			requestContext = new Context();
		}
		requestContext.setUserAgent(userAgent);
		context.set(requestContext);
	}

	public static void clear() {
		context.remove();
	}

	@Data
	public static class Context {

		private String userAgent;

	}

}
