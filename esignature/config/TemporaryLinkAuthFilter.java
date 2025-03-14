package com.skapp.enterprise.esignature.config;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.community.common.service.JwtService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.esignature.model.TemporaryLink;
import com.skapp.enterprise.esignature.service.TemporaryLinkService;
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
public class TemporaryLinkAuthFilter extends OncePerRequestFilter {

	private final JwtService jwtService;

	private final TemporaryLinkService temporaryLinkService;

	private static final Set<String> TEMPORARY_LINK_URLS = Set.of("/v1/ep/document/sign", "/v1/ep/document/view");

	@Override
	protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
		String path = request.getRequestURI();
		return TEMPORARY_LINK_URLS.stream().noneMatch(path::startsWith);
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {

		final String authHeader = request.getHeader(AuthConstants.AUTHORIZATION);
		final String tempLinkToken = request.getParameter("token");

		if (StringUtils.isEmpty(tempLinkToken)
				&& (StringUtils.isEmpty(authHeader) || !StringUtils.startsWith(authHeader, AuthConstants.BEARER))) {
			filterChain.doFilter(request, response);
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		try {
			final String token = StringUtils.isNotEmpty(tempLinkToken) ? tempLinkToken : authHeader.substring(7);

			// Check if the token is a temporary link token
			boolean isTempLinkToken = false;
			try {
				isTempLinkToken = jwtService.extractClaim(token, claims -> claims.get("tempLink", Boolean.class));
			}
			catch (Exception e) {
				log.debug("Not a temporary link token, skipping", e);
				filterChain.doFilter(request, response);
				throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}

			if (!isTempLinkToken) {
				filterChain.doFilter(request, response);
				throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}

			if (jwtService.isTokenExpired(token)) {
				throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_TOKEN_EXPIRED);
			}

			Long linkId = jwtService.extractClaim(token, claims -> claims.get("linkId", Long.class));
			String userEmail = jwtService.extractUserEmail(token);
			Long userId = jwtService.extractUserId(token);
			String tenantId = jwtService.extractClaim(token,
					claims -> claims.get(EpAuthConstants.TENANT_ID, String.class));
			Long documentId = jwtService.extractClaim(token, claims -> claims.get("documentId", Long.class));

			if (tenantId == null && TenantContext.getCurrentTenant() == null) {
				log.error("Token does not contain tenant ID");
				throw new AuthenticationException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
			}

			if (linkId == null || StringUtils.isEmpty(userEmail) || userId == null || StringUtils.isEmpty(tenantId)
					|| documentId == null) {
				throw new AuthenticationException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_LINK);
			}

			// Validate the temporary link in the database and increment click count
			TemporaryLink temporaryLink = temporaryLinkService.validateAndGetLink(token);

			// Authenticate the user
			if (SecurityContextHolder.getContext().getAuthentication() == null) {
				UserDetails userDetails = User.builder()
					.username(userEmail)
					.password("")
					.authorities(Collections.singleton(new SimpleGrantedAuthority("ROLE_TEMP_LINK")))
					.build();

				SecurityContext context = SecurityContextHolder.createEmptyContext();
				UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,
						userId, userDetails.getAuthorities());
				authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
				context.setAuthentication(authToken);
				SecurityContextHolder.setContext(context);

				// Add the document ID to the request attributes for later use
				request.setAttribute("documentId", documentId);
				request.setAttribute("tempLinkId", temporaryLink.getId());
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

}