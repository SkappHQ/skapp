package com.skapp.enterprise.esignature.service;

import io.jsonwebtoken.Claims;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Key;
import java.util.Map;
import java.util.function.Function;

public interface ExternalDocumentJwtService {

	String extractUserType(String token);

	String extractUserEmail(String token);

	String extractTokenType(String token);

	String generateDocumentAccessToken(UserDetails userDetails, Map<String, Object> extraClaims);

	boolean isTokenValid(String token, UserDetails userDetails);

	boolean isTokenExpired(String token);

	boolean isAccessAllowed(String token);

	Long extractUserId(String token);

	Key getSigningKey();

	<T> T extractClaim(String token, Function<Claims, T> claimsResolvers);

}
