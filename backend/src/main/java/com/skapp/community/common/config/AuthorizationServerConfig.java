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
import org.springframework.security.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.web.SecurityFilterChain;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

/**
 * OAuth 2.1 Authorization Server, added as a dedicated {@link SecurityFilterChain}
 * (ordered first) that governs only the {@code /oauth2/**} endpoints. It runs alongside
 * the existing custom-JWT security chain, which is left unchanged.
 *
 * <p>
 * MCP clients (e.g. Claude connectors) obtain access tokens here via OAuth 2.1 with PKCE
 * and OIDC dynamic client registration. User login is delegated to the real Skapp
 * {@code /signin} (see
 * {@link com.skapp.community.common.controller.v1.OAuthSessionLoginController}).
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class AuthorizationServerConfig {

	private final UserDao userDao;

	private final BulkContextService bulkContextService;

	@Value("${oauth2.issuer}")
	private String issuer;

	@Value("${oauth2.signin-redirect-url}")
	private String signInRedirectUrl;

	@Value("${oauth2.jwk.private-key:}")
	private String jwkPrivateKey;

	@Value("${oauth2.jwk.public-key:}")
	private String jwkPublicKey;

	@Value("${oauth2.jwk.key-id:skapp-oauth}")
	private String jwkKeyId;

	@Bean
	@Order(1)
	public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
		OAuth2AuthorizationServerConfigurer authorizationServerConfigurer = new OAuth2AuthorizationServerConfigurer();

		http.securityMatcher(authorizationServerConfigurer.getEndpointsMatcher())
			.with(authorizationServerConfigurer,
					authorizationServer -> authorizationServer
						.oidc(oidc -> oidc.clientRegistrationEndpoint(Customizer.withDefaults())))
			.authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
			// Unauthenticated /oauth2/authorize -> redirect to the real Skapp /signin,
			// passing
			// the original authorize URL as ?callback so the FE can return here after
			// login.
			.exceptionHandling(exceptions -> exceptions.authenticationEntryPoint((request, response, authException) -> {
				String target = request.getRequestURL().toString();
				if (request.getQueryString() != null) {
					target += "?" + request.getQueryString();
				}
				response
					.sendRedirect(signInRedirectUrl + "?callback=" + URLEncoder.encode(target, StandardCharsets.UTF_8));
			}))
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
		RSAKey rsaKey = (jwkPrivateKey.isBlank() || jwkPublicKey.isBlank()) ? generateRsaKey() : loadConfiguredRsaKey();
		return new ImmutableJWKSet<>(new JWKSet(rsaKey));
	}

	@Bean
	public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
		return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
	}

	/**
	 * Embeds the identity/tenant claims downstream services need: {@code roles} from the
	 * authenticated resource owner, {@code userId} resolved by email, and the current
	 * {@code tenant}.
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

	private RSAKey loadConfiguredRsaKey() {
		try {
			KeyFactory keyFactory = KeyFactory.getInstance("RSA");
			RSAPublicKey publicKey = (RSAPublicKey) keyFactory
				.generatePublic(new X509EncodedKeySpec(Base64.getDecoder().decode(jwkPublicKey)));
			RSAPrivateKey privateKey = (RSAPrivateKey) keyFactory
				.generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(jwkPrivateKey)));
			return new RSAKey.Builder(publicKey).privateKey(privateKey).keyID(jwkKeyId).build();
		}
		catch (GeneralSecurityException e) {
			throw new IllegalStateException("Failed to load the configured OAuth RSA signing key", e);
		}
	}

	private RSAKey generateRsaKey() {
		try {
			KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
			keyPairGenerator.initialize(2048);
			KeyPair keyPair = keyPairGenerator.generateKeyPair();
			log.warn("oauth2.jwk keys are not configured; generated an ephemeral RSA signing key. "
					+ "Configure oauth2.jwk.private-key/public-key for non-dev environments.");
			return new RSAKey.Builder((RSAPublicKey) keyPair.getPublic())
				.privateKey((RSAPrivateKey) keyPair.getPrivate())
				.keyID(jwkKeyId)
				.build();
		}
		catch (GeneralSecurityException e) {
			throw new IllegalStateException("Failed to generate an RSA signing key for the authorization server", e);
		}
	}

}
