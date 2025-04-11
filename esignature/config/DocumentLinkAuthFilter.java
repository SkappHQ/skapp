package com.skapp.enterprise.esignature.config;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.type.TokenType;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.esignature.model.ExternalUser;
import com.skapp.enterprise.esignature.service.ExternalDocumentJwtService;
import com.skapp.enterprise.esignature.service.ExternalUserService;
import com.skapp.enterprise.esignature.type.UserType;
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
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Slf4j
@AllArgsConstructor
@Component
@Primary
public class DocumentLinkAuthFilter extends OncePerRequestFilter {

	private static final Set<String> TEMPORARY_LINK_URLS = Set.of("/v1/ep/esign/document-link/access");

	private static final int TOKEN_PREFIX_LENGTH = 7; // Length of "Bearer "

	private static final String DOCUMENT_ID_PARAM = "documentId";

	private static final String RECIPIENT_ID_PARAM = "recipientId";

	private static final String ROLE_TEMP_LINK = "ROLE_TEMP_ESIGN_USER";

	private final ExternalDocumentJwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final ExternalUserService externalUserService;

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

			String tokenType = jwtService.extractTokenType(token);

			if (!TokenType.TEMP_ACCESS.toString().equals(tokenType)) {
				throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}

			if (Boolean.TRUE.equals(jwtService.isTokenExpired(token))) {
				throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_TOKEN_EXPIRED);
			}

			String userEmail = jwtService.extractUserEmail(token);
			Long userId = jwtService.extractUserId(token);
			String tenantId = jwtService.extractClaim(token,
					claims -> claims.get(EpAuthConstants.TENANT_ID, String.class));
			Long documentId = jwtService.extractClaim(token, claims -> claims.get(DOCUMENT_ID_PARAM, Long.class));
			Long recipientId = jwtService.extractClaim(token, claims -> claims.get(RECIPIENT_ID_PARAM, Long.class));

			validateTenantId(tenantId);
			validateDocumentAndRecipient(documentId, recipientId);
			validateRequestParameters(request, documentId, recipientId);

			if (StringUtils.isNotEmpty(userEmail) && userId != null
					&& SecurityContextHolder.getContext().getAuthentication() == null) {
				authenticateUser(request, token, userEmail, userId);
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

	private void validateAuthHeader(String authHeader) {
		if (StringUtils.isEmpty(authHeader) || !StringUtils.startsWith(authHeader, AuthConstants.BEARER)) {
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}
	}

	private void validateTenantId(String tenantId) {
		if (tenantId == null && TenantContext.getCurrentTenant() == null) {
			log.error("Token does not contain tenant ID");
			throw new AuthenticationException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}
	}

	private void validateDocumentAndRecipient(Long documentId, Long recipientId) {
		if (documentId == null || recipientId == null) {
			throw new AuthenticationException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_LINK);
		}
	}

	private void validateRequestParameters(HttpServletRequest request, Long documentId, Long recipientId) {
		String documentIdIdFromRequestParam = request.getParameter(DOCUMENT_ID_PARAM);
		String recipientIdFromRequestParam = request.getParameter(RECIPIENT_ID_PARAM);

		if (StringUtils.isEmpty(documentIdIdFromRequestParam) || StringUtils.isEmpty(recipientIdFromRequestParam)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		if (!documentId.toString().equals(documentIdIdFromRequestParam)
				|| !recipientId.toString().equals(recipientIdFromRequestParam)) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_LINK);
		}
	}

	private void authenticateUser(HttpServletRequest request, String token, String userEmail, Long userId) {

		final String userType = jwtService.extractUserType(token);
		Long linkId = jwtService.extractClaim(token, claims -> claims.get("linkId", Long.class));

		UserDetails userDetails;

		if (userType.equals(UserType.INTERNAL.name())) {
			userDetails = userDetailsService.loadUserByUsername(userEmail);
		}
		else {
			ExternalUser externalUser = externalUserService.loadUserByEmail(userEmail);
			userDetails = User.builder()
				.username(externalUser.getEmail())
				.password("")
				.authorities(Collections.singleton(new SimpleGrantedAuthority(ROLE_TEMP_LINK)))
				.build();
		}

		if (!jwtService.isTokenValid(token, userDetails)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_INVALID_TOKEN);
		}

		request.setAttribute("linkId", linkId);

		SecurityContext context = SecurityContextHolder.createEmptyContext();
		UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, userId,
				userDetails.getAuthorities());
		Map<String, Object> details = new HashMap<>();
		details.put("linkId", linkId);
		authToken.setDetails(details);
		context.setAuthentication(authToken);
		SecurityContextHolder.setContext(context);

	}

}
