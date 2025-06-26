package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.service.AmazonCloudFrontService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.util.io.pem.PemReader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.services.cloudfront.CloudFrontUtilities;
import software.amazon.awssdk.services.cloudfront.cookie.CookiesForCustomPolicy;
import software.amazon.awssdk.services.cloudfront.model.CustomSignerRequest;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AmazonCloudFrontServiceImpl implements AmazonCloudFrontService {

	private static final String KEY_ALGORITHM = "RSA";

	private static final String COOKIE_POLICY = "CloudFront-Policy";

	private static final String COOKIE_SIGNATURE = "CloudFront-Signature";

	private static final String COOKIE_KEY_PAIR_ID = "CloudFront-Key-Pair-Id";

	@Value("${aws.cloudfront.s3-default.key-pair-id}")
	private String keyPairId;

	@Value("${aws.cloudfront.s3-default.private-key-path}")
	private String privateKeyPath;

	@Value("${aws.cloudfront.s3-default.resource-url}")
	private String resourceUrl;

	@Value("${aws.cloudfront.sign-cookies-expiration}")
	private int signCookiesExpiration;

	private final CloudFrontUtilities cloudFrontUtilities;

	@Override
	public Map<String, String> generateCloudFrontSignedCookies() {
		log.info("start Generating CloudFront signed cookies");

		try {
			validateConfiguration();

			Instant expiresAt = Instant.now().plusSeconds(signCookiesExpiration);
			PrivateKey privateKey = loadPrivateKeyFromResource();

			return generateCookiesWithCustomPolicy(expiresAt, privateKey);
		}
		catch (Exception e) {
			log.error("Failed to generate CloudFront signed cookies", e);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_CLOUD_FRONT_SIGNED_COOKIES_GENERATION_FAILED);
		}
	}

	private Map<String, String> generateCookiesWithCustomPolicy(Instant expiresAt, PrivateKey privateKey) {

		CustomSignerRequest customSignerRequest = CustomSignerRequest.builder()
			.resourceUrl(resourceUrl)
			.privateKey(privateKey)
			.keyPairId(keyPairId)
			.expirationDate(expiresAt)
			.build();

		CookiesForCustomPolicy cookies = cloudFrontUtilities.getCookiesForCustomPolicy(customSignerRequest);

		return convertCustomPolicyToMap(cookies);
	}

	private Map<String, String> convertCustomPolicyToMap(CookiesForCustomPolicy cookies) {

		Map<String, String> cookieMap = new HashMap<>();
		cookieMap.put(COOKIE_POLICY, cookies.policyHeaderValue());
		cookieMap.put(COOKIE_SIGNATURE, cookies.signatureHeaderValue());
		cookieMap.put(COOKIE_KEY_PAIR_ID, cookies.keyPairIdHeaderValue());

		return cookieMap;
	}

	private PrivateKey loadPrivateKeyFromResource() {
		log.info("Loading private key from resource");

		try (InputStream inputStream = new ClassPathResource(privateKeyPath).getInputStream();
				InputStreamReader reader = new InputStreamReader(inputStream);
				PemReader pemReader = new PemReader(reader)) {

			byte[] pemContent = pemReader.readPemObject().getContent();
			PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(pemContent);
			KeyFactory keyFactory = KeyFactory.getInstance(KEY_ALGORITHM);

			PrivateKey key = keyFactory.generatePrivate(keySpec);
			log.info("Successfully loaded private key");
			return key;
		}
		catch (IOException e) {
			log.error("Failed to read private key file:", e);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_FILE_NOT_EXIST);
		}
		catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
			log.error("Failed to parse private key", e);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_CLOUD_FRONT_FAILED_T0_PARSE_PRIVATE_KEY);
		}
	}

	private void validateConfiguration() {
		if (!StringUtils.hasText(keyPairId)) {
			throw new IllegalArgumentException("CloudFront key pair ID must be configured");
		}
		if (!StringUtils.hasText(privateKeyPath)) {
			throw new IllegalArgumentException("CloudFront private key path must be configured");
		}
		if (!StringUtils.hasText(resourceUrl)) {
			throw new IllegalArgumentException("CloudFront resource URL must be configured");
		}
		if (signCookiesExpiration <= 0) {
			throw new IllegalArgumentException("CloudFront cookies expiration must be positive");
		}
	}

}
