package com.skapp.community.common.controller.v1;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.AccessTokenResponseDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

/**
 * Exchanges an OAuth 2.1 access token issued by this server's authorization server
 * (RS256, presented by an MCP client such as Claude) for the internal Skapp access token
 * that the downstream services (e.g. skapp-pm) already accept. Server-to-server;
 * authenticated by the OAuth token itself (validated against the authorization server's
 * JWKS).
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/auth/oauth")
@Tag(name = "OAuth Token Exchange", description = "Exchange an OAuth access token for an internal Skapp token")
public class OAuthTokenExchangeController {

	private static final String BEARER_PREFIX = "Bearer ";

	private final JwtDecoder jwtDecoder;

	private final UserDao userDao;

	private final UserDetailsService userDetailsService;

	private final JwtService jwtService;

	@Operation(summary = "Exchange OAuth token",
			description = "Validate an authorization-server access token and mint the internal Skapp access token.")
	@PostMapping(value = "/token-exchange", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> exchange(HttpServletRequest request) {
		String authHeader = request.getHeader("Authorization");
		if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		Jwt jwt;
		try {
			jwt = jwtDecoder.decode(authHeader.substring(BEARER_PREFIX.length()));
		}
		catch (JwtException e) {
			log.warn("token-exchange: invalid OAuth token: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String email = jwt.getSubject();
		Optional<User> optionalUser = (email != null) ? userDao.findByEmail(email) : Optional.empty();
		if (optionalUser.isEmpty()) {
			log.warn("token-exchange: no user for subject={}", email);
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		UserDetails userDetails = userDetailsService.loadUserByUsername(email);
		String internalAccessToken = jwtService.generateAccessToken(userDetails, optionalUser.get().getUserId());

		AccessTokenResponseDto responseDto = new AccessTokenResponseDto();
		responseDto.setAccessToken(internalAccessToken);

		log.info("token-exchange: issued internal token for userId={}", optionalUser.get().getUserId());
		return new ResponseEntity<>(new ResponseEntityDto(false, responseDto), HttpStatus.OK);
	}

}
