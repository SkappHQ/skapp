package com.skapp.enterprise.common.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Filter that captures User-Agent header for specific e-signature endpoints. This filter
 * runs only for whitelisted URL patterns to avoid unnecessary overhead. The captured
 * User-Agent is stored in RequestContext for audit trail purposes.
 */
@Slf4j
@Component
public class UserAgentCaptureFilter extends OncePerRequestFilter {

	private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

	/**
	 * Whitelist of URL patterns that require User-Agent capture. Currently scoped to
	 * e-signature module endpoints that generate audit trails.
	 */
	private static final List<String> ALLOWED_PATTERNS = Arrays.asList("/v1/ep/esign/audit-trial/**",
			"/v1/ep/esign/documents/**", "/v1/ep/esign/envelopes/**");

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {

		String requestPath = request.getRequestURI();

		// Only capture User-Agent for whitelisted paths
		if (shouldCaptureUserAgent(requestPath)) {
			String userAgent = request.getHeader("User-Agent");
			AuditRequestContext.setUserAgent(userAgent);
			log.debug("User-Agent captured for e-signature request: {} - Path: {}", userAgent, requestPath);
		}

		try {
			filterChain.doFilter(request, response);
		}
		finally {
			// Clean up ThreadLocal to prevent memory leaks
			AuditRequestContext.clear();
		}
	}

	/**
	 * Checks if the request path matches any of the whitelisted patterns.
	 * @param requestPath the URI path of the current request
	 * @return true if User-Agent should be captured for this path
	 */
	private boolean shouldCaptureUserAgent(String requestPath) {
		return ALLOWED_PATTERNS.stream().anyMatch(pattern -> PATH_MATCHER.match(pattern, requestPath));
	}

}
