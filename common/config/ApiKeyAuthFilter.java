package com.skapp.enterprise.common.config;

import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@Order(1)
public class ApiKeyAuthFilter extends OncePerRequestFilter {

	private static final List<String> INTERNAL_API_PATHS = List.of("/internal/v1/ep/users",
			"/internal/v1/ep/users/auth-pics", "/internal/v1/ep/versions", "/internal/v1/ep/jobs",
			"/internal/v1/ep/invoice/customer", "/internal/v1/ep/invoice/project",
			"/internal/v1/ep/esign/migration/repair-document-hashes",
			"/internal/v1/ep/esign/migration/repair-document-hashes/status", "/internal/v1/ep/organization/timezone",
			"/v1/announcement", "/v1/announcement/list", "/v1/announcement/image/signed-url",
			"/internal/v1/ep/user/guest", "/internal/v1/ep/ai/prompt-logs", "/internal/v1/ep/ai/prompt-logs/messages");

	@Value("${internal.api.key}")
	private String expectedApiKey;

	@Override
	protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
		return INTERNAL_API_PATHS.stream().noneMatch(path -> request.getRequestURI().equals(path));
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {

		String apiKey = request.getHeader(EpAuthConstants.API_KEY_HEADER);

		if (apiKey == null || apiKey.trim().isEmpty()) {
			throw new AuthenticationException(EPCommonMessageConstant.EP_COMMON_ERROR_API_KEY_MISSING);
		}

		if (!apiKey.equals(expectedApiKey.trim())) {
			throw new AuthenticationException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_API_KEY);
		}

		UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
				EpAuthConstants.INTERNAL_API_USER, null,
				List.of(new SimpleGrantedAuthority(EpAuthConstants.ROLE_INTERNAL_API)));

		SecurityContextHolder.getContext().setAuthentication(authentication);

		filterChain.doFilter(request, response);
	}

}
