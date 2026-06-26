package com.skapp.community.common.component;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@AllArgsConstructor
@Component
@ConditionalOnMissingBean(name = "EpJwtAuthFilter")
public class JwtAuthFilter extends OncePerRequestFilter {

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final ProfileActivator profileActivator;

	@Override
	protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
		return profileActivator.isEpProfile();
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		log.info("doFilterInternal: execution started");

		final String authHeader = request.getHeader(AuthConstants.AUTHORIZATION);
		final String accessToken;
		final String userEmail;

		if (StringUtils.isEmpty(authHeader) || !StringUtils.startsWith(authHeader, AuthConstants.BEARER)) {
			filterChain.doFilter(request, response);
			return;
		}

		accessToken = authHeader.substring(7);
		if (jwtService.isRefreshToken(accessToken)) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			return;
		}

		userEmail = jwtService.extractUserEmail(accessToken);
		Long userId = jwtService.extractUserId(accessToken);

		jwtService.checkVersionMismatch(userId, accessToken);

		if (StringUtils.isNotEmpty(userEmail) && SecurityContextHolder.getContext().getAuthentication() == null) {
			UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
			if (jwtService.isTokenValid(accessToken, userDetails)) {
				SecurityContext context = SecurityContextHolder.createEmptyContext();
				UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,
						userId, userDetails.getAuthorities());
				authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
				context.setAuthentication(authToken);
				SecurityContextHolder.setContext(context);
			}
		}
		filterChain.doFilter(request, response);

		log.info("doFilterInternal: execution ended");
	}

}
