package com.skapp.enterprise.common.config;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.service.JwtService;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.SuperAdminDao;
import com.skapp.enterprise.common.payload.request.AdditionalDetailsDto;
import com.skapp.enterprise.common.payload.request.AuthenticationDetailsDto;
import com.skapp.enterprise.common.type.Tier;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@AllArgsConstructor
@Component
@Primary
public class EpJwtAuthFilter extends OncePerRequestFilter {

	private static final Set<String> PUBLIC_URLS = Set.of("/v3/api-docs", "/v3/api-docs.yaml", "/swagger-ui.html",
			"/swagger-ui", "/swagger-resources", "/swagger-ui/index.html", "/swagger-ui/index.css", "/favicon.ico",
			"/swagger-ui/swagger-ui-standalone-preset.js", "/swagger-ui/swagger-ui.css", "/v3/api-docs/swagger-config",
			"/swagger-ui/swagger-ui-bundle.js", "/swagger-ui/swagger-initializer.js", "/swagger-ui/favicon-16x16.png",
			"/swagger-ui/favicon-32x32.png", "/v1/auth", "/v1/app-setup-status", "/ws",
			"/v1/ep/auth/signup/super-admin", "/v1/ep/auth/domain/verify", "/v1/ep/auth/signup/super-admin/sso/google",
			"/v1/auth/sign-in", "/v1/ep/auth/signin/sso/google", "/v1/ep/tenant/create", "/v1/ep/reset-database",
			"/robots.txt", "/v1/ep/auth/recaptcha", "/health", "/deployment", "/v1/ep/organization/login-method",
			"/v1/ep/auth/password-reset", "/v1/ep/auth/password-reset/verify-otp",
			"/v1/ep/auth/password-reset/send-otp", "/v1/ep/auth/password-reset/resend-otp", "/v1/auth/refresh-token",
			"/v1/ep/auth/tenant/availability", "/v1/google-calendar/redirect", "/v1/validate/email",
			"/v1/ep/stripe/webhook", "/v1/ep/esign/document-link/access", "/v2/ep/auth/sso/google/auth-url",
			"/v2/ep/auth/sso/google/redirect", "/v2/ep/auth/signin/sso/google",
			"/v2/ep/auth/signup/super-admin/sso/google", "/v1/ep/auth/code-challenge/verify",
			"/v1/ep/esign/documents/sign", "/v1/ep/esign/documents/sign-field", "/v1/ep/esign/envelopes/decline",
			"/v1/ep/esign/envelopes/signature-certificate", "/v1/ep/esign/recipients/consent",
			"/v2/ep/auth/sso/microsoft/auth-url", "/v2/ep/auth/sso/microsoft/redirect",
			"/v2/ep/auth/signup/super-admin/sso/microsoft", "/v2/ep/auth/signin/sso/microsoft",
			"/v1/ep/esign/document-link/resend", "/v1/ep/esign/audit-trial/create",
			"/v1/ep/esign/document-link/token-exchange", "/v1/ep/esign/config/external",
			"/v1/ep/s3/esign/files/signed-url", "/v1/ep/esign/document-link/token/resend-status",
			"/v1/ep/cf/cookies/signature", "/v1/ep/cf/cookies/document", "/v1/ep/redis/load-all-users",
			"/v1/ep/redis/load-system-version", "/v1/ep/redis/load-all-user-versions", "/internal/v1/ep/users",
			"/internal/v1/ep/users/auth-pics", "/internal/v1/ep/versions", "/internal/v1/ep/jobs",
			"/v1/ep/release/generate-pdf", "/v1/microsoft-calendar/redirect", "/internal/v1/ep/invoice/customer",
			"/internal/v1/ep/invoice/project", "/v1/ep/auth/signin/guest/send-otp",
			"/v1/ep/auth/signin/guest/resend-otp", "/v1/ep/auth/signin/guest/verify-otp", "/v1/ep/auth/status",
			"/v1/auth/session/sign-in", "/v1/auth/session/sign-out", "/v1/auth/session/refresh-token",
			"/v2/ep/auth/session/signin/sso/google", "/v2/ep/auth/session/signin/sso/microsoft",
			"/v1/ep/auth/session/code-challenge/verify", "/v1/ep/esign/audit-trail/create",
			"/v1/ep/auth/session/signin/guest/verify-otp", "/v1/ep/esign/document-link/send-otp",
			"/v1/ep/esign/document-link/resend-otp", "/v1/ep/esign/document-link/verify-otp",
			"/internal/v1/ep/organization/timezone", "/internal/v1/ep/esign/migration/repair-document-hashes",
			"/internal/v1/ep/esign/migration/repair-document-hashes/status",
			"/internal/v1/ep/organization/timezone", "/v1/announcement", "/v1/announcement/list",
			"/v1/announcement/image/signed-url");

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final SuperAdminDao superAdminDao;

	@Override
	protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
		String path = request.getRequestURI();
		return PUBLIC_URLS.stream().anyMatch(path::equals);
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {

		final String authHeader = request.getHeader(AuthConstants.AUTHORIZATION);

		if (StringUtils.isEmpty(authHeader) || !StringUtils.startsWith(authHeader, AuthConstants.BEARER)) {
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		try {
			final String accessToken = authHeader.substring(7);

			if (jwtService.isTokenExpired(accessToken)) {
				throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_TOKEN_EXPIRED);
			}

			if (jwtService.isRefreshToken(accessToken)) {
				throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_REFRESH_TOKEN_NOT_ALLOWED);
			}

			String userEmail = jwtService.extractUserEmail(accessToken);
			Long userId = jwtService.extractUserId(accessToken);
			String tenantId = jwtService.extractClaim(accessToken,
					claims -> claims.get(EpAuthConstants.TENANT_ID, String.class));

			if (tenantId == null && TenantContext.getCurrentTenant() == null) {
				log.error("Token does not contain tenant ID");
				throw new AuthenticationException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
			}

			jwtService.checkVersionMismatch(userId, accessToken);

			if (StringUtils.isNotEmpty(userEmail) && userId != null
					&& SecurityContextHolder.getContext().getAuthentication() == null) {
				authenticateUser(request, accessToken, userEmail, userId, tenantId);
			}

			filterChain.doFilter(request, response);
		}
		catch (ExpiredJwtException e) {
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_TOKEN_EXPIRED);
		}
		catch (JwtException e) {
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_INVALID_TOKEN);
		}
	}

	private void authenticateUser(HttpServletRequest request, String accessToken, String userEmail, Long userId,
			String tenantId) {
		UserDetails userDetails;

		if (EpCommonConstants.MASTER_DATABASE.equals(tenantId)) {
			log.info("debug: EpJwtAuthFilter - Authenticating super admin user with ID: {}", userId);
			userDetails = superAdminDao.findById(userId)
				.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUPER_ADMIN_NOR_FOUND));
		}
		else {
			userDetails = userDetailsService.loadUserByUsername(userEmail);
		}

		if (!jwtService.isTokenValid(accessToken, userDetails)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_INVALID_TOKEN);
		}

		List<Tier> tiers = Optional
			.ofNullable(jwtService.extractClaim(accessToken, claims -> claims.get(EpAuthConstants.TIERS)))
			.map(list -> ((List<?>) list).stream()
				.filter(String.class::isInstance)
				.map(String.class::cast)
				.map(Tier::valueOf)
				.toList())
			.orElse(List.of());

		String tenantStatus = jwtService.extractClaim(accessToken,
				claims -> claims.get(EpAuthConstants.TENANT_STATUS, String.class));
		AdditionalDetailsDto additionalDetails = new AdditionalDetailsDto(tiers, tenantStatus);

		SecurityContext context = SecurityContextHolder.createEmptyContext();
		log.info("debug: EpJwtAuthFilter - Creating authentication token for user ID: {}", userId);
		UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, userId,
				userDetails.getAuthorities());

		WebAuthenticationDetails webDetails = new WebAuthenticationDetailsSource().buildDetails(request);
		AuthenticationDetailsDto authenticationDetails = new AuthenticationDetailsDto(webDetails, additionalDetails);

		authToken.setDetails(authenticationDetails);
		log.info("debug: EpJwtAuthFilter - Setting authentication in security context for user ID: {}", userId);

		context.setAuthentication(authToken);
		SecurityContextHolder.setContext(context);
	}

}
