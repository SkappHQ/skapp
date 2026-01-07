package com.skapp.enterprise.esignature.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for PDF Digital Signing feature.
 *
 * This configuration logs initialization details when the PDF signing feature is enabled.
 * The actual beans (SignatureProvider, PdfSigningService) are
 * auto-configured via @Component/@Service annotations and @ConditionalOnProperty.
 *
 * The configuration is driven by application properties and environment variables,
 * allowing seamless switching between local development and production environments.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
@ConditionalOnProperty(name = "skapp.pdf-signing.enabled", havingValue = "true")
public class PdfSigningConfiguration {

	@Value("${skapp.pdf-signing.provider}")
	private String providerType;

	@PostConstruct
	public void logConfiguration() {
		log.info("=".repeat(60));
		log.info("PDF Digital Signing Feature: ENABLED");
		log.info("  Provider Type: {}", providerType);
		log.info("  Configuration: application-ep-*.yml (skapp.pdf-signing)");
		log.info("=".repeat(60));
	}

	// Note: All beans are auto-configured via component scanning:
	// - SignatureProvider implementations (LocalSignatureProvider,
	// AzureKeyVaultSignatureProvider)
	// - PdfSigningServiceImpl (@Service with @RequiredArgsConstructor)
	//
	// Bean selection is controlled by @ConditionalOnProperty:
	// - When provider=local: LocalSignatureProvider
	// - When provider=azure: AzureKeyVaultSignatureProvider

}
