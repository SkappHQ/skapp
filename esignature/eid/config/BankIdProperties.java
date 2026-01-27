package com.skapp.enterprise.esignature.eid.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for Swedish BankID integration.
 *
 * <p>
 * Properties are loaded from application.yml under the prefix
 * "skapp.esign.eid.providers.swedish-bankid".
 * </p>
 *
 * <p>
 * Example configuration:
 *
 * <pre>
 * skapp:
 *   esign:
 *     eid:
 *       providers:
 *         swedish-bankid:
 *           enabled: true
 *           api-base-url: https://appapi2.test.bankid.com/rp/v6.0
 *           certificate-path: classpath:enterprise/certs/bankid.p12
 *           certificate-password: ${BANKID_CERTIFICATE_PASSWORD}
 * </pre>
 * </p>
 */
@Data
@Component
@ConfigurationProperties(prefix = "skapp.esign.eid.providers.swedish-bankid")
public class BankIdProperties {

	/**
	 * Whether Swedish BankID provider is enabled.
	 */
	private boolean enabled = false;

	/**
	 * BankID API base URL.
	 *
	 * <p>
	 * Test environment: https://appapi2.test.bankid.com/rp/v6.0 Production environment:
	 * https://appapi2.bankid.com/rp/v6.0
	 * </p>
	 */
	private String apiBaseUrl = "https://appapi2.test.bankid.com/rp/v6.0";

	/**
	 * Path to the PKCS#12 certificate file for mTLS authentication.
	 *
	 * <p>
	 * Can be a classpath resource (classpath:...) or file path (file:...).
	 * </p>
	 */
	private Resource certificatePath;

	/**
	 * Password for the PKCS#12 certificate file.
	 */
	private String certificatePassword;

	/**
	 * Whether to trust all SSL certificates (disable certificate verification).
	 *
	 * <p>
	 * WARNING: Only enable this for local development/testing. Never use in production as
	 * it makes the connection vulnerable to man-in-the-middle attacks.
	 * </p>
	 *
	 * <p>
	 * Default: false (use standard certificate validation)
	 * </p>
	 */
	private boolean trustAllCertificates = false;

}
