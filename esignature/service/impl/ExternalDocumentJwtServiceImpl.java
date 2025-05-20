package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.repository.DocumentLinkRepository;
import com.skapp.enterprise.esignature.service.ExternalDocumentJwtService;
import com.skapp.enterprise.esignature.type.TokenType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalDocumentJwtServiceImpl implements ExternalDocumentJwtService {

	public static final String TOKEN_TYPE = "token_type";

	public static final String USER_ID = "userId";

	private final DocumentLinkRepository documentLinkRepository;

	@Value("${jwt.access-token.esign.expiration-time}")
	private Long jwtDocumentAccessTokenExpirationMs;

	@Value("${jwt.access-token.esign.doc-access-key}")
	private String jwtDocumentSigningKey;

	@Override
	public Long extractUserId(String token) {
		return extractClaim(token, claims -> claims.get(USER_ID, Long.class));
	}

	@Override
	public String extractTokenType(String token) {
		return extractClaim(token, claims -> claims.get(TOKEN_TYPE, String.class));
	}

	@Override
	public String extractUserType(String token) {
		return extractClaim(token, claims -> claims.get("userType", String.class));
	}

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
	public <T> T extractClaim(String token, Function<Claims, T> claimsResolvers) {
		final Claims claims = extractAllClaims(token);
		return claimsResolvers.apply(claims);
	}

	private Claims extractAllClaims(String token) {
		return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
	}

	@Override
	public SecretKey getSigningKey() {
		String tenant = TenantContext.getCurrentTenant();
		if (tenant == null) {
			return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtDocumentSigningKey));
		}

		byte[] masterKeyBytes = Decoders.BASE64.decode(jwtDocumentSigningKey);
		byte[] derivedKeyBytes = deriveTenantKey(masterKeyBytes, tenant);
		return Keys.hmacShaKeyFor(derivedKeyBytes);
	}

	private byte[] deriveTenantKey(byte[] masterKey, String tenantId) {
		try {
			Mac hmacSha256 = Mac.getInstance("HmacSHA256");
			SecretKeySpec keySpec = new SecretKeySpec(masterKey, "HmacSHA256");
			hmacSha256.init(keySpec);
			return hmacSha256.doFinal(tenantId.getBytes(StandardCharsets.UTF_8));
		}
		catch (Exception e) {
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_JWT_SIGNIN_KEY_GENERATION_ISSUE);
		}
	}

	@Override
	public String generateDocumentAccessToken(UserDetails userDetails, Map<String, Object> extraClaims) {
		Map<String, Object> claims = new HashMap<>();

		if (extraClaims != null) {
			claims.putAll(extraClaims);
		}

		claims.put(TOKEN_TYPE, TokenType.DOCUMENT_ACCESS);

		return Jwts.builder()
			.claims(claims)
			.subject(userDetails.getUsername())
			.issuedAt(new Date(System.currentTimeMillis()))
			.expiration(new Date(System.currentTimeMillis() + jwtDocumentAccessTokenExpirationMs))
			.signWith(getSigningKey())
			.compact();
	}

	@Override
	public boolean isTokenValid(String token, UserDetails userDetails) {
		final String userEmail = extractUserEmail(token);
		return (userEmail.equals(userDetails.getUsername()));
	}

	@Override
	public boolean isTokenExpired(String token) {
		return isDocumentAccessUrlExpired(token);
	}

	@Override
	public boolean isAccessAllowed(String token) {
		DocumentLink documentLink = documentLinkRepository.findByToken(token)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_OR_EXPIRED_LINK));

		documentLink.incrementClickCount();

		documentLinkRepository.save(documentLink);

		return !documentLink.isExpired();
	}

	public Boolean isDocumentAccessUrlExpired(String token) {
		DocumentLink documentLink = documentLinkRepository.findByToken(token)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_OR_EXPIRED_LINK));

		return documentLink.isExpired();
	}

}
