package com.skapp.enterprise.common.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class RequestMethodContext {

	private static final ThreadLocal<Boolean> IS_READ_ONLY = new ThreadLocal<>();

	private static final String HTTP_METHOD_GET = "GET";

	private static final boolean DEFAULT_READ_ONLY = false;

	public static void determineReadOnly() {
		try {
			ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
				.getRequestAttributes();
			if (attributes != null) {
				HttpServletRequest request = attributes.getRequest();
				String method = request.getMethod();
				boolean readOnly = HTTP_METHOD_GET.equalsIgnoreCase(method);
				IS_READ_ONLY.set(readOnly);

				log.info("Request method: {}, readOnly set to: {}", method, readOnly);
			}
			else {
				IS_READ_ONLY.set(DEFAULT_READ_ONLY);
				log.debug("No request context available, defaulting to write mode");
			}
		}
		catch (Exception e) {
			IS_READ_ONLY.set(DEFAULT_READ_ONLY);
			log.error("Error determining read/write mode from request method", e);
		}
	}

	public static boolean isReadOnly() {
		Boolean readOnly = IS_READ_ONLY.get();
		return readOnly != null && readOnly;
	}

	public static void clear() {
		IS_READ_ONLY.remove();
		if (log.isTraceEnabled()) {
			log.trace("Request method context cleared");
		}
	}

}
