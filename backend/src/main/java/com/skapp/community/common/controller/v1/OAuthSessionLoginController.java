package com.skapp.community.common.controller.v1;

import com.skapp.community.common.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Bridges the real Skapp {@code /signin} into the OAuth Authorization Server session.
 * Flow: the AS redirects an unauthenticated {@code /oauth2/authorize} to the FE
 * {@code /signin?return=<authorize-uri>}; the user logs in normally (existing auth,
 * unchanged) and the FE obtains the internal access token; the FE then POSTs that token
 * here. This endpoint validates it and seeds an authenticated {@link SecurityContext}
 * into the HTTP session so that when the browser is redirected back to
 * {@code /oauth2/authorize}, the Authorization Server sees an authenticated resource
 * owner and can issue the code.
 *
 * Lives outside {@code /oauth2/**} so it is handled by the existing (stateless) app
 * chain; it authenticates the caller by validating the presented internal token, then
 * creates the servlet session the AS chain reads.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/auth/oauth")
@Tag(name = "OAuth Session Login", description = "Bridges Skapp sign-in into the OAuth authorization session")
public class OAuthSessionLoginController {

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	@Operation(summary = "OAuth session login",
			description = "Seed the OAuth authorization session from a valid Skapp access token, "
					+ "then the client redirects back to the authorize endpoint.")
	@PostMapping(value = "/session-login", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Void> sessionLogin(@RequestBody OAuthSessionLoginRequest request,
			HttpServletRequest httpRequest) {
		String accessToken = request.token();
		if (accessToken == null || accessToken.isBlank()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String email = jwtService.extractUserEmail(accessToken);
		UserDetails userDetails = userDetailsService.loadUserByUsername(email);

		if (jwtService.isTokenExpired(accessToken) || !jwtService.isTokenValid(accessToken, userDetails)) {
			log.warn("sessionLogin: invalid or expired token for email={}", email);
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		// Use a String principal + SimpleGrantedAuthority so the authorization (persisted
		// by
		// JdbcOAuth2AuthorizationService) round-trips through Spring Security's Jackson
		// mapper.
		List<GrantedAuthority> authorities = userDetails.getAuthorities()
			.stream()
			.map(authority -> (GrantedAuthority) new SimpleGrantedAuthority(authority.getAuthority()))
			.toList();
		Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, authorities);
		SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
		securityContext.setAuthentication(authentication);
		SecurityContextHolder.setContext(securityContext);

		HttpSession session = httpRequest.getSession(true);
		session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

		log.info("sessionLogin: authorization session established for email={}", email);
		return ResponseEntity.ok().build();
	}

	public record OAuthSessionLoginRequest(String token) {
	}

}
