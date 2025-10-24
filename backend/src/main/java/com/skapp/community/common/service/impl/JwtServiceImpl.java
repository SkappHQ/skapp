package com.skapp.community.common.service.impl;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.service.SystemVersionService;
import com.skapp.community.common.service.UserVersionService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.type.TokenType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

	private final SystemVersionService systemVersionService;

	private final UserVersionService userVersionService;

	@Value("${jwt.access-token.signing-key}")
	private String jwtSigningKey;

	@Value("${jwt.access-token.expiration-time}")
	private Long jwtAccessTokenExpirationMs;

	@Value("${jwt.refresh-token.long-duration.expiration-time}")
	private Long jwtLongDurationRefreshTokenExpirationMs;

	@Value("${jwt.refresh-token.short-duration.expiration-time}")
	private Long jwtShortDurationRefreshTokenExpirationMs;

	@Override
	public String extractUserEmail(String token) {
		String email = "";
		try {
			email = extractClaim(token, Claims::getSubject);
		}
		catch (Exception e) {
			log.info(e.getMessage());
		}
		return email;
	}

	@Override
	public String extractTokenType(String token) {
		return extractClaim(token, claims -> claims.get(AuthConstants.TOKEN_TYPE, String.class));
	}

	@Override
	public String generateAccessToken(UserDetails userDetails, Long userId) {
		Map<String, Object> claims = createAccessTokenClaims(userDetails, userId);
		return generateToken(claims, userDetails, jwtAccessTokenExpirationMs);
	}

	@Override
	public String generateRefreshToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		claims.put(AuthConstants.TOKEN_TYPE, TokenType.REFRESH);

		Set<String> shortDurationRoles = getShortDurationRoles();

		boolean hasShortDurationRole = userDetails.getAuthorities()
			.stream()
			.anyMatch(authority -> shortDurationRoles.contains(authority.getAuthority()));

		long jwtRefreshTokenExpirationMs;

		if (hasShortDurationRole) {
			jwtRefreshTokenExpirationMs = jwtShortDurationRefreshTokenExpirationMs;
		}
		else {
			jwtRefreshTokenExpirationMs = jwtLongDurationRefreshTokenExpirationMs;
		}

		return generateToken(claims, userDetails, jwtRefreshTokenExpirationMs);
	}

	/**
	 * Validates the given JWT token by performing two checks:
	 * <p>
	 * 1. Ensures that the token's subject (typically the user email or username) matches
	 * the username from the provided {@link UserDetails}. 2. Verifies that the token has
	 * not expired.
	 * @param token the JWT token to validate
	 * @param userDetails the {@link UserDetails} object containing the expected username
	 * @return {@code true} if the token's subject matches the userDetails' username and
	 * the token is not expired; {@code false} otherwise
	 */
	@Override
	public boolean isTokenValid(String token, UserDetails userDetails) {
		final String userEmail = extractUserEmail(token);
		return (userEmail.equals(userDetails.getUsername())) && !isTokenExpired(token);
	}

	@Override
	public boolean isRefreshToken(String refreshToken) {
		return extractTokenType(refreshToken).equals(TokenType.REFRESH.name());
	}

	@Override
	public Long extractUserId(String token) {
		return extractClaim(token, claims -> claims.get(AuthConstants.USER_ID, Long.class));
	}

	@Override
	public <T> T extractClaim(String token, Function<Claims, T> claimsResolvers) {
		final Claims claims = extractAllClaims(token);
		return claimsResolvers.apply(claims);
	}

	private String generateToken(Map<String, Object> extraClaims, UserDetails userDetails, Long expirationTime) {
		Map<String, Object> claims = new HashMap<>();
		if (extraClaims != null) {
			claims.putAll(extraClaims);
		}

		return Jwts.builder()
			.claims(claims)
			.subject(userDetails.getUsername())
			.issuedAt(new Date(System.currentTimeMillis()))
			.expiration(new Date(System.currentTimeMillis() + expirationTime))
			.signWith(getSigningKey())
			.compact();
	}

	@Override
	public boolean isTokenExpired(String token) {
		return extractExpiration(token).before(new Date());
	}

	@Override
	public void checkVersionMismatch(Long userId, String accessToken) {
		String systemVersion = extractClaim(accessToken,
				claims -> claims.get(AuthConstants.SYSTEM_VERSION, String.class));
		String latestSystemVersion = systemVersionService.getLatestSystemVersion();
		if (systemVersion != null && !systemVersion.equals(latestSystemVersion)) {
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_SYSTEM_VERSION_MISMATCH);
		}

		if (userId != null) {
			String userVersion = extractClaim(accessToken,
					claims -> claims.get(AuthConstants.USER_VERSION, String.class));
			String latestUserVersion = userVersionService.getUserVersion(userId);

			if (userVersion != null && !userVersion.equals(latestUserVersion)) {
				throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_USER_VERSION_MISMATCH);
			}
		}
	}

	private Date extractExpiration(String token) {
		return extractClaim(token, Claims::getExpiration);
	}

	private Claims extractAllClaims(String token) {
		return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
	}

	protected Map<String, Object> createAccessTokenClaims(UserDetails userDetails, Long userId) {
		Map<String, Object> claims = new HashMap<>();
		List<String> roles = userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();

		String systemVersion = systemVersionService.getLatestSystemVersion();
		String userVersion = userVersionService.getUserVersion(userId);

		claims.put(AuthConstants.TOKEN_TYPE, TokenType.ACCESS);
		claims.put(AuthConstants.USER_ID, userId);
		claims.put(AuthConstants.ROLES, roles);
		claims.put(AuthConstants.SYSTEM_VERSION, systemVersion);
		claims.put(AuthConstants.USER_VERSION, userVersion);

		return claims;
	}

	public SecretKey getSigningKey() {
		byte[] keyBytes = Decoders.BASE64.decode(jwtSigningKey);
		return Keys.hmacShaKeyFor(keyBytes);
	}

	protected Set<String> getShortDurationRoles() {
		Set<String> roles = new HashSet<>();
		roles.add(AuthConstants.AUTH_ROLE + Role.SUPER_ADMIN);
		roles.add(AuthConstants.AUTH_ROLE + Role.ATTENDANCE_ADMIN);
		roles.add(AuthConstants.AUTH_ROLE + Role.PEOPLE_ADMIN);
		roles.add(AuthConstants.AUTH_ROLE + Role.LEAVE_ADMIN);
		roles.add(AuthConstants.AUTH_ROLE + Role.OKR_ADMIN);
		roles.add(AuthConstants.AUTH_ROLE + Role.INVOICE_ADMIN);
		return roles;
	}

}
