package com.skapp.community.common.service;

import io.jsonwebtoken.Claims;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Key;
import java.util.function.Function;

public interface JwtService {

	String extractUserEmail(String token);

	String extractTokenType(String token);

	String generateAccessToken(UserDetails userDetails, Long userId);

	String generateRefreshToken(UserDetails userDetails);

	boolean isTokenValid(String token, UserDetails userDetails);

	boolean isRefreshToken(String refreshToken);

	boolean isTokenExpired(String token);

	Long extractUserId(String token);

	Key getSigningKey();

	<T> T extractClaim(String token, Function<Claims, T> claimsResolvers);

	void checkVersionMismatch(Long userId, String accessToken);

	long getRefreshTokenMaxAge(UserDetails userDetails);

}
