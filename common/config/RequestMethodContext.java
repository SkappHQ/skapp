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

	private static final ThreadLocal<Boolean> isRead = new ThreadLocal<>();

	private static final String HTTP_METHOD_GET = "GET";

	public static void determineReadOnly() {
		try {
			ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
				.getRequestAttributes();
			if (attributes != null) {
				HttpServletRequest request = attributes.getRequest();
				String method = request.getMethod();
				boolean readOnly = HTTP_METHOD_GET.equalsIgnoreCase(method);
				isRead.set(readOnly);

				log.info("Request method: {}, readOnly set to: {}", method, readOnly);
			}
			else {
				isRead.set(false);
				log.debug("No request context available, defaulting to write mode");
			}
		}
		catch (Exception e) {
			isRead.set(false);
			log.error("Error determining read/write mode from request method", e);
		}
	}

	public static boolean isReadOnly() {
		Boolean readOnly = isRead.get();
		return readOnly != null && readOnly;
	}

	public static void setReadOnly(boolean readOnly) {
		isRead.set(readOnly);
		if (log.isTraceEnabled()) {
			log.trace("Request method context set to readOnly: {}", readOnly);
		}
	}

	public static void clear() {
		isRead.remove();
		if (log.isTraceEnabled()) {
			log.trace("Request method context cleared");
		}
	}

}
