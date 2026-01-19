package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.service.UserService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.service.AmazonCloudFrontService;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.service.DocumentService;
import com.skapp.enterprise.esignature.util.EsignUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.util.io.pem.PemReader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.services.cloudfront.CloudFrontUtilities;
import software.amazon.awssdk.services.cloudfront.cookie.CookiesForCustomPolicy;
import software.amazon.awssdk.services.cloudfront.model.CustomSignerRequest;

import java.io.IOException;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
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

	public static final String HTTPS_PROTOCOL = "https://";

	public static final String DOCUMENT_S3_PATH_URL = "/envelop/process/documents/";

	public static final String TEMPLATE_DOCUMENT_S3_PATH_URL = "/template/";

	public static final String WILDCARD_PATH = "/*";

	@Value("${aws.cloudfront.s3-default.key-pair-id}")
	private String keyPairId;

	@Value("${aws.cloudfront.s3-default.private-key}")
	private String privateKey;

	@Value("${aws.cloudfront.sign-cookies-expiration}")
	private int signCookiesExpiration;

	@Value("${aws.cloudfront.s3-default.domain-name}")
	private String cloudFrontDomain;

	private final CloudFrontUtilities cloudFrontUtilities;

	private final UserService userService;

	private final DocumentService documentService;

	private final AddressBookDao addressBookDao;

	@Override
	public Map<String, String> generateCloudFrontDocumentSignedCookies() {
		String tenant = TenantContext.getCurrentTenant();

		String resourceUrl = HTTPS_PROTOCOL + cloudFrontDomain + DOCUMENT_S3_PATH_URL + tenant + WILDCARD_PATH;
		return generateCloudFrontSignedCookies(resourceUrl);
	}

	@Override
	public Map<String, String> generateCloudFrontSignatureSignedCookies(boolean isInternal) {
		AddressBook addressBook;
		if (isInternal) {
			User currentUser = userService.getCurrentUser();

			if (currentUser == null) {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_USER_NOT_FOUND);
			}

			addressBook = addressBookDao.findByInternalUser(currentUser)
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND));
		}
		else {
			String currentUsername = documentService.getCurrentUsername();
			addressBook = addressBookDao.findByInternalUserEmail(currentUsername)
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND));
		}

		if (addressBook.getMySignatureLink() == null || addressBook.getMySignatureLink().isBlank()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_MY_SIGNATURE_LINK_NOT_FOUND);
		}

		String signatureObjectKey = addressBook.getMySignatureLink();
		String resourceUrlPath = EsignUtil.removeEsignPrefix(signatureObjectKey);
		String resourceUrl = HTTPS_PROTOCOL + cloudFrontDomain + "/" + resourceUrlPath;
		return generateCloudFrontSignedCookies(resourceUrl);
	}

	@Override
	public Map<String, String> generateCloudFrontTemplateDocumentSignedCookies() {

		String tenant = TenantContext.getCurrentTenant();

		String resourceUrl = HTTPS_PROTOCOL + cloudFrontDomain + TEMPLATE_DOCUMENT_S3_PATH_URL + tenant + WILDCARD_PATH;
		return generateCloudFrontSignedCookies(resourceUrl);
	}

	private Map<String, String> generateCloudFrontSignedCookies(String resourceUrl) {
		log.info("start Generating CloudFront signed cookies");

		try {
			validateConfiguration();

			Instant expiresAt = Instant.now().plusSeconds(signCookiesExpiration);

			String decodePrivateKey = decodeBase64ToString(privateKey);

			PrivateKey privateKeyVal = loadPrivateKeyFromString(decodePrivateKey);

			return generateCookiesWithCustomPolicy(expiresAt, privateKeyVal, resourceUrl);
		}
		catch (Exception e) {
			log.error("Failed to generate CloudFront signed cookies", e);
			throw new ModuleException(
					EPCommonMessageConstant.EP_COMMON_ERROR_CLOUD_FRONT_SIGNED_COOKIES_GENERATION_FAILED);
		}
	}

	private Map<String, String> generateCookiesWithCustomPolicy(Instant expiresAt, PrivateKey privateKey,
			String resourceUrl) {

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

	public static String decodeBase64ToString(String base64) {
		byte[] decodedBytes = Base64.getDecoder().decode(base64);
		return new String(decodedBytes, StandardCharsets.UTF_8);
	}

	private PrivateKey loadPrivateKeyFromString(String pemString) {
		log.info("Loading private key from string");

		try (StringReader stringReader = new StringReader(pemString);
				PemReader pemReader = new PemReader(stringReader)) {
			byte[] pemContent = pemReader.readPemObject().getContent();
			PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(pemContent);
			KeyFactory keyFactory = KeyFactory.getInstance(KEY_ALGORITHM);

			PrivateKey key = keyFactory.generatePrivate(keySpec);
			log.info("Successfully loaded private key");
			return key;
		}
		catch (IOException e) {
			log.error("Failed to read private key string:", e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CLOUD_FRONT_PRIVATE_KEY_FAILED_TO_LOAD);
		}
		catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
			log.error("Failed to parse private key", e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CLOUD_FRONT_FAILED_TO_PARSE_PRIVATE_KEY);
		}
	}

	private void validateConfiguration() {
		if (!StringUtils.hasText(keyPairId)) {
			throw new IllegalArgumentException("CloudFront key pair ID must be configured");
		}
		if (!StringUtils.hasText(privateKey)) {
			throw new IllegalArgumentException("CloudFront private key must be configured");
		}
		if (signCookiesExpiration <= 0) {
			throw new IllegalArgumentException("CloudFront cookies expiration must be positive");
		}
	}

}
