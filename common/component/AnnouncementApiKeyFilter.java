package com.skapp.enterprise.common.component;

import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Protects announcement CRUD endpoints with a shared API key.
 * These endpoints are called by the Admin Portal BE on behalf of super admins.
 * Paths: POST/GET /v1/announcement, GET/PUT /v1/announcement/{id}
 * Paths excluded: /v1/announcement/eligible, /v1/announcement/{id}/interact
 */
@Component
public class AnnouncementApiKeyFilter extends OncePerRequestFilter {

	private static final String API_KEY_HEADER = "X-Admin-Api-Key";

	private static final String CRUD_BASE_PATH = "/v1/announcement";

	@Value("${admin-portal.api-key}")
	private String expectedApiKey;

	@Override
	protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
		String uri = request.getRequestURI();
		return !uri.startsWith(CRUD_BASE_PATH)
				|| uri.equals(CRUD_BASE_PATH + "/eligible")
				|| uri.endsWith("/interact");
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		String apiKey = request.getHeader(API_KEY_HEADER);

		if (apiKey == null || apiKey.trim().isEmpty()) {
			throw new AuthenticationException(EPCommonMessageConstant.EP_COMMON_ERROR_API_KEY_MISSING);
		}

		if (!apiKey.equals(expectedApiKey.trim())) {
			throw new AuthenticationException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_API_KEY);
		}

		request.setAttribute("ANNOUNCEMENT_API_KEY_AUTHENTICATED", Boolean.TRUE);
		filterChain.doFilter(request, response);
	}

}
