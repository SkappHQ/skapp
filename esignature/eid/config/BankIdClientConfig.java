package com.skapp.enterprise.esignature.eid.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.io.HttpClientConnectionManager;
import org.apache.hc.client5.http.ssl.DefaultClientTlsStrategy;
import org.apache.hc.client5.http.ssl.TlsSocketStrategy;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.SSLContext;
import java.io.InputStream;
import java.security.KeyStore;

/**
 * Configuration for BankID HTTP client with mTLS (mutual TLS) support.
 *
 * <p>
 * This configuration sets up a RestTemplate with client certificate authentication
 * required by BankID API. The client certificate must be provided as a PKCS#12 file.
 * </p>
 *
 * <p>
 * Activated when: skapp.esign.eid.providers.swedish-bankid.enabled=true
 * </p>
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
@ConditionalOnProperty(name = "skapp.esign.eid.providers.swedish-bankid.enabled", havingValue = "true")
public class BankIdClientConfig {

	private final BankIdProperties bankIdProperties;

	@PostConstruct
	public void logConfiguration() {
		log.info("============================================================");
		log.info("BankID Integration: ENABLED");
		log.info("  API Base URL: {}", bankIdProperties.getApiBaseUrl());
		log.info("  Certificate Path: {}", bankIdProperties.getCertificatePath() != null
				? bankIdProperties.getCertificatePath().getDescription() : "NOT CONFIGURED");
		log.info("  Trust All Certificates: {}", bankIdProperties.isTrustAllCertificates());
		if (bankIdProperties.isTrustAllCertificates()) {
			log.warn("  ⚠️  WARNING: trust-all-certificates is ENABLED - DO NOT use in production!");
		}
		log.info("============================================================");
	}

	/**
	 * Creates a RestTemplate configured with mTLS for BankID API communication.
	 * @return RestTemplate with SSL context for mTLS
	 */
	@Bean("bankIdRestTemplate")
	public RestTemplate bankIdRestTemplate() {
		try {
			// Load PKCS#12 keystore containing client certificate and private key
			KeyStore keyStore = KeyStore.getInstance("PKCS12");
			try (InputStream keystoreStream = bankIdProperties.getCertificatePath().getInputStream()) {
				keyStore.load(keystoreStream, bankIdProperties.getCertificatePassword().toCharArray());
			}

			// Build SSL context with client certificate (mTLS)
			SSLContextBuilder sslContextBuilder = SSLContextBuilder.create()
				.loadKeyMaterial(keyStore, bankIdProperties.getCertificatePassword().toCharArray());

			// Configure trust material based on environment setting
			if (bankIdProperties.isTrustAllCertificates()) {
				// WARNING: Only for local development/testing - disables certificate
				// verification
				log.warn("Using trust-all certificate strategy - NOT SAFE FOR PRODUCTION");
				sslContextBuilder.loadTrustMaterial(null, (certificate, authType) -> true);
			}
			else {
				// Production: Use default JVM trust store (cacerts) for standard SSL
				// verification
				sslContextBuilder.loadTrustMaterial((KeyStore) null, null);
			}

			SSLContext sslContext = sslContextBuilder.build();

			// Create TLS strategy with the SSL context
			TlsSocketStrategy tlsStrategy = new DefaultClientTlsStrategy(sslContext);

			// Create connection manager with TLS
			HttpClientConnectionManager connectionManager = PoolingHttpClientConnectionManagerBuilder.create()
				.setTlsSocketStrategy(tlsStrategy)
				.build();

			// Create HTTP client with SSL connection manager
			CloseableHttpClient httpClient = HttpClients.custom().setConnectionManager(connectionManager).build();

			// Create RestTemplate with the configured HTTP client
			HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory(
					httpClient);

			log.info("BankID RestTemplate initialized with mTLS certificate");

			return new RestTemplate(requestFactory);

		}
		catch (Exception e) {
			log.error("Failed to initialize BankID RestTemplate with mTLS", e);
			throw new IllegalStateException("Failed to configure BankID client certificate", e);
		}
	}

}
