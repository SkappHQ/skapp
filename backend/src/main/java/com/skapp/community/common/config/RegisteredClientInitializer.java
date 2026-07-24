package com.skapp.community.common.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Registers (or updates) a static OAuth client on startup when
 * {@code oauth2.client.client-id} is configured. This supports MCP clients such as Claude
 * connecting with a preassigned client id (public client + PKCE), which is the path used
 * when anonymous Dynamic Client Registration is not enabled. It is a no-op when no client
 * id is configured.
 */
@Slf4j
@Component
public class RegisteredClientInitializer implements CommandLineRunner {

	private final RegisteredClientRepository registeredClientRepository;

	@Value("${oauth2.client.client-id:}")
	private String clientId;

	@Value("${oauth2.client.redirect-uris:}")
	private String redirectUris;

	@Value("${oauth2.client.scopes:openid}")
	private String scopes;

	public RegisteredClientInitializer(RegisteredClientRepository registeredClientRepository) {
		this.registeredClientRepository = registeredClientRepository;
	}

	@Override
	public void run(String... args) {
		if (clientId == null || clientId.isBlank()) {
			return;
		}

		RegisteredClient existing = registeredClientRepository.findByClientId(clientId);
		String id = (existing != null) ? existing.getId() : UUID.randomUUID().toString();

		RegisteredClient.Builder builder = RegisteredClient.withId(id)
			.clientId(clientId)
			.clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
			.authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
			.authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
			.clientSettings(ClientSettings.builder().requireProofKey(true).requireAuthorizationConsent(true).build());

		for (String uri : redirectUris.split(",")) {
			if (!uri.isBlank()) {
				builder.redirectUri(uri.strip());
			}
		}
		for (String scope : scopes.split(",")) {
			if (!scope.isBlank()) {
				builder.scope(scope.strip());
			}
		}

		registeredClientRepository.save(builder.build());
		log.info("Registered OAuth client '{}' ({})", clientId, (existing != null) ? "updated" : "created");
	}

}
