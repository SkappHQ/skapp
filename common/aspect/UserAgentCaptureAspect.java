package com.skapp.enterprise.common.aspect;

import com.skapp.enterprise.common.config.AuditContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Aspect that captures User-Agent header for methods annotated with @CaptureUserAgent.
 * The User-Agent is stored in AuditRequestContext and automatically cleared after
 * the method execution completes.
 */
@Slf4j
@Aspect
@Component
public class UserAgentCaptureAspect {

	/**
	 * Intercepts methods annotated with @CaptureUserAgent to capture and store the
	 * User-Agent header from the HTTP request.
	 *
	 * @param joinPoint the method execution join point
	 * @return the result of the method execution
	 * @throws Throwable if the underlying method throws an exception
	 */
	@Around("@annotation(com.skapp.enterprise.common.annotation.CaptureUserAgent)")
	public Object captureUserAgent(ProceedingJoinPoint joinPoint) throws Throwable {
		HttpServletRequest request = getCurrentHttpRequest();

		if (request != null) {
			String userAgent = request.getHeader("User-Agent");
			AuditContext.setUserAgent(userAgent);
			log.debug("User-Agent captured for audit: {} - Method: {}", userAgent,
					joinPoint.getSignature().toShortString());
		}
		else {
			log.warn("No HTTP request found in context for method: {}", joinPoint.getSignature().toShortString());
		}

		try {
			return joinPoint.proceed();
		}
		finally {
			// Clean up ThreadLocal to prevent memory leaks
			AuditContext.clear();
		}
	}

	/**
	 * Retrieves the current HTTP request from Spring's RequestContextHolder.
	 *
	 * @return the current HttpServletRequest, or null if not available
	 */
	private HttpServletRequest getCurrentHttpRequest() {
		ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
		return attributes != null ? attributes.getRequest() : null;
	}

}
