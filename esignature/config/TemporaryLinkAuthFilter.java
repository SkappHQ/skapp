package com.skapp.enterprise.esignature.config;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.TokenType;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.esignature.service.TemporarySignLinkService;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Set;

@Slf4j
@AllArgsConstructor
@Component
@Primary
public class TemporaryLinkAuthFilter extends OncePerRequestFilter {

	private final JwtService jwtService;

	private final TemporarySignLinkService temporarySignLinkService;

	private static final Set<String> TEMPORARY_LINK_URLS = Set.of("/v1/ep/esign/sign-link/envelope");

	private static final int TOKEN_PREFIX_LENGTH = 7; // Length of "Bearer "

	private static final String ENVELOPE_ID_PARAM = "envelopeId";

	private static final String RECIPIENT_ID_PARAM = "recipientId";

	private static final String ROLE_TEMP_LINK = "ROLE_TEMP_ESIGN_USER";

	@Override
	protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
		String path = request.getRequestURI();
		return TEMPORARY_LINK_URLS.stream().noneMatch(path::startsWith);
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {

		try {
			final String authHeader = request.getHeader(AuthConstants.AUTHORIZATION);
			validateAuthHeader(authHeader);

			final String token = authHeader.substring(TOKEN_PREFIX_LENGTH);
			validateTokenType(token);

			if (Boolean.TRUE.equals(temporarySignLinkService.isExpired(token))) {
				throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_TOKEN_EXPIRED);
			}

			// Extract claims from token
			String userEmail = jwtService.extractUserEmail(token);
			Long userId = jwtService.extractUserId(token);
			String tenantId = jwtService.extractClaim(token,
					claims -> claims.get(EpAuthConstants.TENANT_ID, String.class));
			Long envelopeId = jwtService.extractClaim(token, claims -> claims.get(ENVELOPE_ID_PARAM, Long.class));
			Long recipientId = jwtService.extractClaim(token, claims -> claims.get(RECIPIENT_ID_PARAM, Long.class));

			// Validate claims
			validateTenantId(tenantId);
			validateEnvelopeAndRecipient(envelopeId, recipientId);
			validateRequestParameters(request, envelopeId, recipientId);

			// Authenticate the user if not already authenticated
			authenticateUser(request, userEmail, userId);

			// Continue with the filter chain
			filterChain.doFilter(request, response);
		}
		catch (ExpiredJwtException e) {
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_TOKEN_EXPIRED);
		}
		catch (JwtException e) {
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_INVALID_TOKEN);
		}
	}

	private void validateAuthHeader(String authHeader) {
		if (StringUtils.isEmpty(authHeader) || !StringUtils.startsWith(authHeader, AuthConstants.BEARER)) {
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}
	}

	private void validateTokenType(String token) {
		String tokenType = jwtService.extractClaim(token, claims -> claims.get(AuthConstants.TOKEN_TYPE, String.class));

		if (!TokenType.TEMP_ACCESS.toString().equals(tokenType)) {
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}
	}

	private void validateTenantId(String tenantId) {
		if (tenantId == null && TenantContext.getCurrentTenant() == null) {
			log.error("Token does not contain tenant ID");
			throw new AuthenticationException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}
	}

	private void validateEnvelopeAndRecipient(Long envelopeId, Long recipientId) {
		if (envelopeId == null || recipientId == null) {
			throw new AuthenticationException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_LINK);
		}
	}

	private void validateRequestParameters(HttpServletRequest request, Long envelopeId, Long recipientId) {
		String envelopeIdFromRequestParam = request.getParameter(ENVELOPE_ID_PARAM);
		String recipientIdFromRequestParam = request.getParameter(RECIPIENT_ID_PARAM);

		if (StringUtils.isEmpty(envelopeIdFromRequestParam) || StringUtils.isEmpty(recipientIdFromRequestParam)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		if (!envelopeId.toString().equals(envelopeIdFromRequestParam)
				|| !recipientId.toString().equals(recipientIdFromRequestParam)) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_LINK);
		}
	}

	private void authenticateUser(HttpServletRequest request, String userEmail, Long userId) {
		if (SecurityContextHolder.getContext().getAuthentication() == null) {
			UserDetails userDetails = User.builder()
				.username(userEmail)
				.password("")
				.authorities(Collections.singleton(new SimpleGrantedAuthority(ROLE_TEMP_LINK)))
				.build();

			SecurityContext context = SecurityContextHolder.createEmptyContext();
			UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, userId,
					userDetails.getAuthorities());
			authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
			context.setAuthentication(authToken);
			SecurityContextHolder.setContext(context);
		}
	}

}
