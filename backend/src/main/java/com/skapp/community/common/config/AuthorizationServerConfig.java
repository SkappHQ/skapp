package com.skapp.community.common.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.BulkContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Authorization Server (OAuth 2.1) — an ADDITIVE layer that lives alongside the
 * existing custom JWT auth (which is left untouched). It only governs the OAuth endpoints
 * (its own filter chain, ordered first); every other request continues through the
 * existing {@code SecurityConfig} / {@code EPSecurityConfig} stateless chain.
 *
 * Purpose: let Claude (and other MCP clients) obtain access tokens for the Skapp MCP
 * server via a standards-compliant OAuth 2.1 flow. Login is delegated to the real Skapp
 * {@code /signin} via {@code OAuthSessionLoginController}.
 *
 * NOTE (must verify on build — Spring Boot 4 / Security 7, no build available in the
 * authoring environment): - The JWK source below GENERATES an RSA key at startup. For
 * production this MUST be replaced with a persisted key (env/keystore) with rotation, or
 * tokens are invalidated on restart and across instances. - Anonymous Dynamic Client
 * Registration (RFC 7591), which Claude uses, may require additional configuration of the
 * OIDC client-registration endpoint policy (initial access token) — verify against the
 * resolved SAS version.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class AuthorizationServerConfig {

	private final UserDao userDao;

	private final BulkContextService bulkContextService;

	@Value("${oauth2.issuer:http://localhost:8080}")
	private String issuer;

	@Value("${oauth2.signin-redirect-url:http://localhost:3000/signin}")
	private String signInRedirectUrl;

	@Bean
	@Order(1)
	public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
		OAuth2AuthorizationServerConfigurer authorizationServerConfigurer = new OAuth2AuthorizationServerConfigurer();

		http.securityMatcher(authorizationServerConfigurer.getEndpointsMatcher())
			// Enable OIDC + the client-registration (DCR) endpoint that MCP clients use.
			.with(authorizationServerConfigurer,
					authorizationServer -> authorizationServer
						.oidc(oidc -> oidc.clientRegistrationEndpoint(Customizer.withDefaults())))
			.authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
			// Unauthenticated /oauth2/authorize -> send the browser to the real Skapp
			// /signin.
			.exceptionHandling(exceptions -> exceptions
				.authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint(signInRedirectUrl)))
			// Accept the AS's own JWTs on protected OIDC endpoints (e.g. userinfo).
			.oauth2ResourceServer(resourceServer -> resourceServer.jwt(Customizer.withDefaults()));

		return http.build();
	}

	@Bean
	public RegisteredClientRepository registeredClientRepository(JdbcTemplate jdbcTemplate) {
		return new JdbcRegisteredClientRepository(jdbcTemplate);
	}

	@Bean
	public OAuth2AuthorizationService authorizationService(JdbcTemplate jdbcTemplate,
			RegisteredClientRepository registeredClientRepository) {
		return new JdbcOAuth2AuthorizationService(jdbcTemplate, registeredClientRepository);
	}

	@Bean
	public OAuth2AuthorizationConsentService authorizationConsentService(JdbcTemplate jdbcTemplate,
			RegisteredClientRepository registeredClientRepository) {
		return new JdbcOAuth2AuthorizationConsentService(jdbcTemplate, registeredClientRepository);
	}

	@Bean
	public AuthorizationServerSettings authorizationServerSettings() {
		return AuthorizationServerSettings.builder().issuer(issuer).build();
	}

	@Bean
	public JWKSource<SecurityContext> jwkSource() {
		RSAKey rsaKey = generateRsaKey();
		JWKSet jwkSet = new JWKSet(rsaKey);
		return new ImmutableJWKSet<>(jwkSet);
	}

	@Bean
	public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
		return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
	}

	/**
	 * Embed the identity/tenant claims that the MCP server and downstream Skapp services
	 * need. Roles come from the authenticated resource owner (populated by the /signin
	 * session bridge); userId is resolved by email and tenant is read from the
	 * request-scoped context.
	 */
	@Bean
	public OAuth2TokenCustomizer<JwtEncodingContext> tokenCustomizer() {
		return context -> {
			if (!OAuth2TokenType.ACCESS_TOKEN.equals(context.getTokenType())) {
				return;
			}
			if (context.getPrincipal() == null || context.getPrincipal().getName() == null) {
				return;
			}
			String email = context.getPrincipal().getName();

			List<String> roles = context.getPrincipal()
				.getAuthorities()
				.stream()
				.map(authority -> authority.getAuthority())
				.toList();

			context.getClaims().claim("roles", roles);

			Optional<User> optionalUser = userDao.findByEmail(email);
			optionalUser.ifPresent(user -> context.getClaims().claim("userId", user.getUserId()));

			String tenant = bulkContextService.getContext();
			if (tenant != null && !tenant.isBlank()) {
				context.getClaims().claim("tenant", tenant);
			}
		};
	}

	private RSAKey generateRsaKey() {
		try {
			KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
			keyPairGenerator.initialize(2048);
			KeyPair keyPair = keyPairGenerator.generateKeyPair();
			RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
			RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
			log.warn("AuthorizationServerConfig: generated an in-memory RSA signing key. "
					+ "Replace with a persisted key (env/keystore) + rotation before production.");
			return new RSAKey.Builder(publicKey).privateKey(privateKey).keyID(UUID.randomUUID().toString()).build();
		}
		catch (Exception e) {
			throw new IllegalStateException("Failed to generate RSA key for the authorization server", e);
		}
	}

}
