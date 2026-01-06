package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.util.OtpUtil;
import com.skapp.enterprise.common.util.PhoneNumberMaskUtil;
import com.skapp.enterprise.esignature.constant.EsignConstants;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.model.DocumentVersionField;
import com.skapp.enterprise.esignature.model.EsignVerification;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.request.ResendAccessUrlDto;
import com.skapp.enterprise.esignature.payload.response.DocumentAccessLinkDataResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentLinkResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentTokenResendStatusResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentTokenResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldValueResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientResponseDto;
import com.skapp.enterprise.esignature.repository.DocumentDao;
import com.skapp.enterprise.esignature.repository.DocumentLinkRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionDao;
import com.skapp.enterprise.esignature.repository.DocumentVersionFieldRepository;
import com.skapp.enterprise.esignature.repository.EsignVerificationDao;
import com.skapp.enterprise.esignature.repository.RecipientDao;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.service.EsignEmailService;
import com.skapp.enterprise.esignature.service.EsignMessageService;
import com.skapp.enterprise.esignature.service.ExternalDocumentJwtService;
import com.skapp.enterprise.esignature.type.DocumentPermissionType;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.EsignVerificationType;
import com.skapp.enterprise.esignature.type.UserType;
import com.skapp.enterprise.esignature.util.EsignUtil;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentLinkServiceImpl implements DocumentLinkService {

	public static final String SUB = "sub";

	public static final String USER_ID = "userId";

	public static final String TENANT_ID = "tenantId";

	public static final String ENVELOPE_ID = "envelopeId";

	public static final String DOCUMENT_ID = "documentId";

	public static final String USER_TYPE = "userType";

	public static final String RECIPIENT_ID = "recipientId";

	public static final String TOKEN = "token";

	public static final String PERMISSION = "permission";

	private static final String URL_PATH = "/sign/document/access?uuid=";

	private static final String URL_PATH_MFA = "/sign/document/access/mfa-verify?uuid=";

	private static final String ROLE_DOC_ACCESS = "ROLE_DOC_ACCESS";

	public static final String STATE_STRING = "&state=";

	public static final String HTTPS_PROTOCOL = "https://";

	private static final String SMS_VERIFICATION_CHANNEL = "sms";

	private static final String OTP_SENT_SUCCESS = "OTP sent successfully via ";

	private static final String VERIFICATION_ENABLED = "Verification enabled. ";

	private static final String VERIFICATION_DISABLED = "Verification disabled.";

	private static final String TOO_MANY_OTP_REQUESTS = "Too many OTP requests. Please try again in ";

	private static final String RETRY_TIME_IN_SECONDS = "seconds";

	private final DocumentLinkRepository documentLinkRepository;

	private final ExternalDocumentJwtService jwtService;

	private final EsignEmailService emailService;

	private final UserService userService;

	private final EncryptionDecryptionService encryptionDecryptionService;

	private final DocumentDao documentDao;

	private final RecipientDao recipientDao;

	private final EsignMapper eSignMapper;

	private final DocumentVersionFieldRepository documentVersionFieldRepository;

	private final DocumentVersionDao documentVersionDao;

	private final TenantContext tenantContext;

	private final EsignVerificationDao esignVerificationDao;

	private final MessageUtil messageUtil;

	private final EsignMessageService esignMessageService;

	@Value("${jwt.access-token.esign.expiration-time}")
	private Long jwtDocumentAccessTokenExpirationMs;

	@Value("${jwt.access-token.esign.max-clicks}")
	private int defaultMaxClicks;

	@Value("${app.parent-domain}")
	private String parentDomain;

	@Value("${app.protocol}")
	private String protocol;

	@Value("${encryptDecryptAlgorithm.secret}")
	private String encryptSecret;

	@Value("${aws.cloudfront.s3-default.domain-name}")
	private String cloudFrontDomain;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	@Value("${otp.expiry-seconds}")
	private int otpExpirySeconds;

	@Override
	public DocumentLinkResponseDto generateDocumentAccessUrl(DocumentAccessUrlDto documentAccessUrlDto) {

		Long documentId = documentAccessUrlDto.getDocumentId();
		Long recipientId = documentAccessUrlDto.getRecipientId();

		Optional<Document> documentOptional = documentDao.findById(documentId);

		if (documentOptional.isEmpty()) {
			log.info("generateDocumentAccessUrl: Document with ID {} not found", documentId);
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND);
		}

		Envelope envelope = documentOptional.get().getEnvelope();

		Optional<Recipient> optionalUpdatableRecipient = recipientDao.findById(recipientId);

		Recipient recipient = optionalUpdatableRecipient
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));

		validatePermissionForGenerateAccessUrl(envelope, recipient, documentAccessUrlDto.getPermissionType());

		DocumentLinkData documentLinkData = createDocumentLinkData(documentAccessUrlDto, recipient,
				documentOptional.get(), envelope);
		DocumentLink documentLink = documentLinkData.documentLink();

		documentLinkRepository.save(documentLink);

		return DocumentLinkResponseDto.builder()
			.token(documentLink.getToken())
			.url(documentLinkData.accessUrl())
			.expiresAt(documentLink.getExpiresAt())
			.maxClicks(defaultMaxClicks)
			.build();
	}

	@Override
	public void validatePermissionForGenerateAccessUrl(Envelope envelope, Recipient recipient,
			DocumentPermissionType requestedPermission) {
		List<DocumentLink> activeLinks = documentLinkRepository.findByEnvelopeIdAndRecipientId(envelope, recipient);

		if (activeLinks.isEmpty()) {
			return;
		}

		// Check if any non-expired link already has the requested permission
		boolean hasExistingValidLink = activeLinks.stream().filter(link -> !link.isExpired()).anyMatch(link -> {
			DocumentPermissionType permissionType = link.getPermissionType();

			return switch (requestedPermission) {
				case READ -> permissionType.equals(DocumentPermissionType.READ);
				case WRITE -> permissionType.equals(DocumentPermissionType.WRITE);
				default -> throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_UNSUPPORTED_PERMISSION_TYPE);
			};
		});

		if (hasExistingValidLink) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_VALID_DOCUMENT_ACCESS_LINK_AVAILABLE);
		}
	}

	@Override
	public void resendDocumentAccessURL(ResendAccessUrlDto resendAccessUrlDto) {

		log.info("resendDocumentAccessURL: process started");

		String token = resendAccessUrlDto.getToken();
		if (token == null || token.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ACCESS_LINK_INVALID);
		}

		DocumentLink documentLink = documentLinkRepository.findByToken(token)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ACCESS_LINK_INVALID));

		if (documentLink.isResend()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ACCESS_LINK_ALREADY_RESEND);
		}

		DocumentAccessUrlDto documentAccessUrlDto = new DocumentAccessUrlDto(documentLink.getDocumentId().getId(),
				documentLink.getRecipientId().getId(), documentLink.getPermissionType());

		DocumentLinkResponseDto documentLinkResponseDto = generateDocumentAccessUrl(documentAccessUrlDto);

		emailService.resendEnvelopeEmailToRecipient(documentLink.getEnvelopeId(), documentLink.getRecipientId(),
				documentLinkResponseDto.getUrl());

		documentLink.setResend(true);
		documentLinkRepository.save(documentLink);

		log.info("resendDocumentAccessURL: process end");
	}

	@Override
	public DocumentLinkData createDocumentLinkData(DocumentAccessUrlDto documentAccessUrlDto, Recipient recipient,
			Document document, Envelope envelope) {
		String tenantId = TenantContext.getCurrentTenant();

		if (tenantId == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}

		Long userId = recipient.getAddressBook().getUserId();
		String userEmail = recipient.getAddressBook().getEmail();

		UserDetails userDetails = User.builder()
			.username(userEmail)
			.password("")
			.authorities(Collections.singleton(new SimpleGrantedAuthority(ROLE_DOC_ACCESS)))
			.build();

		UserType userType = recipient.getAddressBook().getType();

		LocalDateTime expiresAt = LocalDateTime.now().plus(Duration.ofMillis(jwtDocumentAccessTokenExpirationMs));

		DocumentLink documentLink = DocumentLink.builder()
			.documentId(document)
			.envelopeId(envelope)
			.recipientId(recipient)
			.createdByUserId(userId)
			.createdAt(LocalDateTime.now())
			.expiresAt(expiresAt)
			.maxClicks(defaultMaxClicks)
			.permissionType(documentAccessUrlDto.getPermissionType())
			.clickCount(0)
			.isActive(true)
			.isResend(false)
			.build();

		DocumentAccessData documentAccessData = new DocumentAccessData(userId, tenantId, envelope.getId(),
				document.getId(), recipient.getId(), userType.name());

		String token;
		if (documentAccessUrlDto.getPermissionType().equals(DocumentPermissionType.WRITE)) {
			token = generateSignAccessToken(userDetails, documentAccessData);
		}
		else {
			token = generateViewAccessToken(userDetails, documentAccessData);
		}

		documentLink.setToken(token);

		String tokenUuid = generateAndEnsureUniqueUuidWithRetry();

		String encryptedUuid = encryptionDecryptionService.encrypt(tokenUuid, encryptSecret);
		documentLink.setUuid(encryptedUuid);

		String accessUrl = generateAccessUrl(tenantId, recipient.getId(), envelope.getUuid(), encryptedUuid);

		return new DocumentLinkData(documentLink, accessUrl);
	}

	@Override
	public ResponseEntityDto getRecipientDocumentData(@NotNull Long documentId, @NotNull Long recipientId,
			boolean isDocAccess) {

		String tenantId = TenantContext.getCurrentTenant();

		if (tenantId == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}

		Document document = documentDao.findById(documentId)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		if (document.getEnvelope() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		}

		Envelope envelope = document.getEnvelope();

		if (EnvelopeStatus.inactiveStatuses().contains(envelope.getStatus())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ACCESS_INACTIVE);
		}

		Recipient recipient = document.getEnvelope()
			.getRecipients()
			.stream()
			.filter(rec -> rec.getId().equals(recipientId))
			.findFirst()
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));

		boolean isVerificationEnabled = validateMfaVerificationEnable(recipient);

		if (isVerificationEnabled && getMfaVerificationStatus(null, documentId, recipientId)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MFA_NOT_VALIDATED);
		}

		validateTokenFlows(isDocAccess, recipient, documentId);

		RecipientResponseDto recipientResponseDto = eSignMapper.recipientToRecipientResponseDto(recipient);

		if (recipient.getAddressBook().getMySignatureLink() != null) {
			recipientResponseDto.getAddressBook()
				.setMySignatureLink(HTTPS_PROTOCOL + cloudFrontDomain + "/"
						+ EsignUtil.removeEsignPrefix(recipient.getAddressBook().getMySignatureLink()));
		}

		int versionNumber = document.getCurrentVersion();
		DocumentVersion documentVersion;

		if (versionNumber < 0) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND);
		}

		if (versionNumber != 0) {
			documentVersion = documentVersionDao.findByVersionNumberAndDocumentId(versionNumber, documentId)
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));
		}
		else {
			documentVersion = new DocumentVersion();
			documentVersion.setFilePath(document.getFilePath());
		}

		DocumentDetailResponseDto latestDocumentDetailsDto = getLatestDocumentDetails(document, documentVersion);

		DocumentLinkResponseDto documentLinkResponseDto = null;

		// currently access token flow works for sign document only
		DocumentPermissionType documentPermissionType = DocumentPermissionType.WRITE;

		if (isDocAccess) {
			DocumentLink documentLink = getDocumentLinkFromToken();
			documentLinkResponseDto = eSignMapper.documentLinkToDocumentLinkResponseDto(documentLink);
			if (documentLink.getUuid() != null) {
				documentLinkResponseDto
					.setUrl(generateAccessUrl(tenantId, recipientId, envelope.getUuid(), documentLink.getUuid()));
			}
			documentLinkResponseDto.setExpiresAt(documentLink.getExpiresAt());
			documentPermissionType = documentLink.getPermissionType();

			log.info("getRecipientDocumentData: documentLinkResponseDto: count: {}",
					documentLinkResponseDto.getClickCount());
		}

		DocumentAccessLinkDataResponseDto documentAccessLinkData = getDocumentAccessLinkDataResponseDto(envelope,
				recipient, recipientResponseDto, latestDocumentDetailsDto, documentLinkResponseDto,
				documentPermissionType);

		return new ResponseEntityDto(false, documentAccessLinkData);

	}

	@Override
	public String getDocumentAccessUrlForNudge(Envelope envelope, Recipient recipient) {
		String tenantId = TenantContext.getCurrentTenant();
		if (tenantId == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}

		Optional<DocumentLink> latestDocumentLink = documentLinkRepository
			.findFirstByRecipientIdAndEnvelopeIdAndPermissionTypeOrderByCreatedAtDesc(recipient, envelope,
					DocumentPermissionType.WRITE);

		if (latestDocumentLink.isPresent()) {
			DocumentLink documentLink = latestDocumentLink.get();
			if (documentLink.isExpired()) {
				documentLink.setActive(false);
				documentLink.setResend(true);
				documentLink = documentLinkRepository.save(documentLink);

				return generateNewAccessUrl(documentLink);
			}
			else {
				return generateAccessUrl(tenantId, recipient.getId(), envelope.getUuid(),
						documentLink.getUuid() != null ? documentLink.getUuid() : null);
			}
		}
		return null;
	}

	@Override
	public DocumentLink getDocumentLinkFromToken() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || authentication.getDetails() == null) {
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		try {
			if (!(authentication.getDetails() instanceof Map)) {
				throw new AuthenticationException(EsignMessageConstant.ESIGN_ERROR_INVALID_DOCUMENT_LINK_METADATA);
			}

			Map<String, Object> details = (Map<String, Object>) authentication.getDetails();
			String token = (String) details.get(TOKEN);

			DocumentLink documentLink = documentLinkRepository.findByToken(token)
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_LINK_NOT_FOUND));

			if (documentLink.isExpired()) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_OR_EXPIRED_LINK);
			}

			return documentLink;
		}
		catch (Exception ex) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_DOCUMENT_LINK);
		}
	}

	@Override
	public void validateTokenFlows(boolean isDocAccess, Recipient recipient, Long documentId) {
		if (isDocAccess) {
			DocumentLink documentLinkFromToken = getDocumentLinkFromToken();

			if (!Objects.equals(documentLinkFromToken.getRecipientId().getId(), recipient.getId())) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}

			if (documentId != null && !Objects.equals(documentLinkFromToken.getDocumentId().getId(), documentId)) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}
		}
		else {
			if (recipient.getAddressBook().getInternalUser() == null
					|| !Objects.equals(recipient.getAddressBook().getInternalUser().getUserId(),
							userService.getCurrentUser().getUserId())) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}
		}
	}

	@Override
	public ResponseEntityDto getTokenFromUuid(@NotNull String uuid, @NotNull String state) {

		DocumentLink documentLink = decodeDocumentLinkFromUuid(uuid, state);

		boolean isVerificationEnabled = validateMfaVerificationEnable(documentLink.getRecipientId());

		if (isVerificationEnabled && getMfaVerificationStatus(documentLink, null, null)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MFA_NOT_VALIDATED);
		}

		DocumentTokenResponseDto documentTokenResponseDto = new DocumentTokenResponseDto();
		documentTokenResponseDto.setToken(documentLink.getToken());

		return new ResponseEntityDto(false, documentTokenResponseDto);

	}

	@Override
	public ResponseEntityDto getTokenResendStatus(@NotNull String token) {

		log.info("getTokenResendStatus: process started");

		if (token == null || token.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ACCESS_LINK_INVALID);
		}

		DocumentLink documentLink = documentLinkRepository.findByToken(token)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ACCESS_LINK_INVALID));

		DocumentTokenResendStatusResponseDto documentTokenResendStatusResponseDto = new DocumentTokenResendStatusResponseDto();

		documentTokenResendStatusResponseDto.setResend(documentLink.isResend());
		log.info("getTokenResendStatus: process end");

		return new ResponseEntityDto(false, documentTokenResendStatusResponseDto);
	}

	@Override
	public ResponseEntityDto sendOtpFromUuid(String uuid, String state) {

		DocumentLink documentLink = decodeDocumentLinkFromUuid(uuid, state);

		return sendVerificationToRecipient(documentLink, null, null);
	}

	@Override
	public ResponseEntityDto sendOtpFromDocumentAndRecipientId(Long documentId, Long recipientId) {

		Recipient recipient = validateAndGetRecipient(documentId, recipientId);
		Document document = documentDao.findById(documentId)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		// MFA Flow: Send OTP and return verification initiated response
		return sendVerificationToRecipient(null, document, recipient);

	}

	@Override
	public ResponseEntityDto verifyOtpFromUuid(String uuid, String state, String code) {

		DocumentLink documentLink = decodeDocumentLinkFromUuid(uuid, state);

		// Verify the OTP
		return verifyCodeWithDocumentRecipient(documentLink, null, null, code);

	}

	@Override
	public ResponseEntityDto verifyOtpFromDocumentAndRecipientId(Long documentId, Long recipientId, String code) {

		validateAndGetRecipient(documentId, recipientId);

		// Verify the OTP
		return verifyCodeWithDocumentRecipient(null, documentId, recipientId, code);

	}

	@Override
	public ResponseEntityDto resendOtpFromUuid(String uuid, String state) {

		DocumentLink documentLink = decodeDocumentLinkFromUuid(uuid, state);

		return sendVerificationToRecipient(documentLink, null, null);

	}

	@Override
	public ResponseEntityDto resendOtpFromDocumentAndRecipientId(Long documentId, Long recipientId) {

		Recipient recipient = validateAndGetRecipient(documentId, recipientId);
		Document document = documentDao.findById(documentId)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		return sendVerificationToRecipient(null, document, recipient);
	}

	@Override
	public ResponseEntityDto getRecipientDocumentVerificationData(Long documentId, Long recipientId) {

		Recipient recipient = validateAndGetRecipient(documentId, recipientId);

		boolean isVerificationEnabled = validateMfaVerificationEnable(recipient);

		if (isVerificationEnabled) {
			// MFA Flow: Send OTP and return verification initiated response

			String maskedChannelInfo;
			String channel;

			if (recipient.getMfaVerificationMethod().equals(EsignVerificationType.SMS)) {

				channel = SMS_VERIFICATION_CHANNEL;

				maskedChannelInfo = recipient.getAddressBook().getPhone() != null
						? PhoneNumberMaskUtil.mask(recipient.getAddressBook().getPhone()) : "";
			}
			else {
				maskedChannelInfo = "";
				channel = "";
			}

			return new ResponseEntityDto(false, VERIFICATION_ENABLED + channel + "=" + maskedChannelInfo);

		}

		return new ResponseEntityDto(false, VERIFICATION_DISABLED);
	}

	private String generateAndEnsureUniqueUuidWithRetry() {
		int maxRetries = 3;
		int retryCount = 0;

		while (retryCount < maxRetries) {
			String uuid = EsignUtil.generateTimestampUUID();

			if (!isDocumentLinkUuidExists(uuid)) {
				return uuid;
			}

			retryCount++;
		}

		throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_LINK_UUID_CREATION_FAIL);
	}

	public boolean isDocumentLinkUuidExists(String uuid) {
		return documentLinkRepository.existsByUuid(uuid);
	}

	private String generateNewAccessUrl(DocumentLink documentLink) {
		DocumentAccessUrlDto documentAccessUrlDto = new DocumentAccessUrlDto(documentLink.getDocumentId().getId(),
				documentLink.getRecipientId().getId(), documentLink.getPermissionType());

		DocumentLinkResponseDto documentLinkResponseDto = generateDocumentAccessUrl(documentAccessUrlDto);
		return documentLinkResponseDto.getUrl();
	}

	private DocumentDetailResponseDto getLatestDocumentDetails(Document document, DocumentVersion documentVersion) {
		DocumentDetailResponseDto dto = new DocumentDetailResponseDto();
		dto.setId(document.getId());
		dto.setName(document.getName());
		dto.setFilePath(HTTPS_PROTOCOL + cloudFrontDomain + "/"
				+ EsignUtil.removeBucketAndEsignPrefix(bucketName, documentVersion.getFilePath()));
		dto.setNumOfPages(document.getNumOfPages());
		return dto;
	}

	private DocumentAccessLinkDataResponseDto getDocumentAccessLinkDataResponseDto(Envelope envelope,
			Recipient recipient, RecipientResponseDto recipientResponseDto,
			DocumentDetailResponseDto documentDetailResponseDto, DocumentLinkResponseDto documentLinkResponseDto,
			DocumentPermissionType permissionType) {

		List<FieldResponseDto> fieldResponseDtoList = permissionType == DocumentPermissionType.WRITE
				? getFieldResponseDtos(recipient) : Collections.emptyList();

		DocumentAccessLinkDataResponseDto documentAccessLinkData = new DocumentAccessLinkDataResponseDto();
		documentAccessLinkData.setName(recipient.getAddressBook().getName());
		documentAccessLinkData.setEmail(recipient.getAddressBook().getEmail());
		documentAccessLinkData.setSenderEmail(envelope.getOwner().getEmail());
		documentAccessLinkData.setEnvelopeId(envelope.getId());
		documentAccessLinkData.setEnvelopeStatus(envelope.getStatus());
		documentAccessLinkData.setSubject(envelope.getSubject());
		documentAccessLinkData.setRecipientResponseDto(recipientResponseDto);
		documentAccessLinkData.setFieldResponseDtoList(fieldResponseDtoList);
		documentAccessLinkData.setDocumentDetailResponseDto(documentDetailResponseDto);
		documentAccessLinkData.setDocumentLinkResponseDto(documentLinkResponseDto);
		return documentAccessLinkData;
	}

	private List<FieldResponseDto> getFieldResponseDtos(Recipient recipientObj) {
		List<Field> fields = recipientObj.getFields();
		List<FieldResponseDto> fieldResponseDtoList = new ArrayList<>();

		fields.forEach(field -> {
			FieldResponseDto fieldResponseDto = eSignMapper.fieldToFieldResponseDto(field);
			DocumentVersionField documentVersionField = documentVersionFieldRepository.findByField(field);
			FieldValueResponseDto fieldValueResponseDto = eSignMapper
				.documentVersionFieldToFieldValueResponseDto(documentVersionField);
			fieldResponseDto.setFieldValueResponseDto(fieldValueResponseDto);
			fieldResponseDtoList.add(fieldResponseDto);
		});
		return fieldResponseDtoList;
	}

	private String generateSignAccessToken(UserDetails userDetails, DocumentAccessData documentAccessData) {
		return generateAccessToken(userDetails, documentAccessData,
				new String[] { DocumentPermissionType.WRITE.getValue() });
	}

	private String generateViewAccessToken(UserDetails userDetails, DocumentAccessData documentAccessData) {
		return generateAccessToken(userDetails, documentAccessData,
				new String[] { DocumentPermissionType.READ.getValue() });
	}

	private String generateAccessToken(UserDetails userDetails, DocumentAccessData data, String[] permissions) {
		Map<String, Object> extraClaims = new HashMap<>();

		extraClaims.put(SUB, userDetails.getUsername());
		extraClaims.put(USER_ID, data.userId());
		extraClaims.put(TENANT_ID, data.tenantId());
		extraClaims.put(ENVELOPE_ID, data.envelopeId());
		extraClaims.put(DOCUMENT_ID, data.documentId());
		extraClaims.put(USER_TYPE, data.userType());
		extraClaims.put(RECIPIENT_ID, data.recipientId());
		extraClaims.put(PERMISSION, permissions);

		return jwtService.generateDocumentAccessToken(userDetails, extraClaims);
	}

	private String generateAccessUrl(String tenantId, Long recipientId, String envelopeUuid, String uuid) {

		String state = recipientId + EsignConstants.DOCUMENT_ACCESS_EMAIL_LINK_STATE_PATTERN + envelopeUuid
				+ EsignConstants.DOCUMENT_ACCESS_EMAIL_LINK_STATE_PATTERN + tenantId;

		String encryptedState = encryptionDecryptionService.encrypt(state, encryptSecret);
		String encodedState = URLEncoder.encode(encryptedState, StandardCharsets.UTF_8);

		String encodedEncryptedUUID = URLEncoder.encode(uuid, StandardCharsets.UTF_8);

		String urlPath = getMFARecipientDetails(recipientId);

		return protocol + "://" + tenantId + "." + parentDomain + urlPath + encodedEncryptedUUID + STATE_STRING
				+ encodedState;
	}

	private String getMFARecipientDetails(Long recipientId) {

		Optional<Recipient> recipientOptional = recipientDao.findById(recipientId);
		Recipient recipient = recipientOptional
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));

		EsignVerificationType verificationMethod = recipient.getMfaVerificationMethod();

		if (verificationMethod.equals(EsignVerificationType.SMS)) {
			String recipientPhone = recipientDao.findPhoneByRecipientId(recipientId);
			String maskedPhone = recipientPhone != null ? PhoneNumberMaskUtil.mask(recipientPhone) : "";
			return URL_PATH_MFA + "?phone=" + maskedPhone;
		}
		else {
			return URL_PATH;
		}

	}

	private record DocumentAccessData(Long userId, String tenantId, Long envelopeId, Long documentId, Long recipientId,
			String userType) {
	}

	private boolean validateMfaVerificationEnable(Recipient recipient) {
		return recipient.isMfaVerificationEnabled();
	}

	private ResponseEntityDto sendVerificationToRecipient(DocumentLink documentLink, Document document,
			Recipient recipient) {

		Recipient recipientData;
		Document documentData;

		if (documentLink != null) {
			recipientData = documentLink.getRecipientId();
			documentData = documentLink.getDocumentId();
		}
		else {
			recipientData = recipient;
			documentData = document;
		}

		// The channel is sms. It's the form the otp is to be shared with the
		// recipient.
		String channel = recipientData.getMfaVerificationMethod().equals(EsignVerificationType.SMS)
				? SMS_VERIFICATION_CHANNEL : null;

		// The target is phone number based on the selected
		// channel.
		String target = recipientData.getMfaVerificationMethod().equals(EsignVerificationType.SMS)
				? recipientData.getAddressBook().getPhone() : null;

		if (channel != null && target != null) {

			// Check if there's an existing active otp request to the recipient for this
			// document.
			Optional<EsignVerification> esignVerificationOptional = esignVerificationDao
				.findByDocument_IdAndRecipient_Id(documentData.getId(), recipientData.getId());

			EsignVerification existingEsignVerification = esignVerificationOptional.orElse(null);

			String otpCode = OtpUtil.generateOTP();
			Instant expiryTime = Instant.now().plusSeconds(otpExpirySeconds);

			if (existingEsignVerification != null) {

				handleOtpBackoffAndSend(existingEsignVerification, target, channel);

			}
			else {

				EsignVerification esignVerification = new EsignVerification();
				esignVerification.setDocument(documentData);
				esignVerification.setRecipient(recipientData);
				esignVerification.setVerificationCode(otpCode);
				esignVerification.setOtpExpiryTime(expiryTime);
				esignVerification.setOtpSentAttemptCount(EsignConstants.ESIGN_DEFAULT_OTP_SENT_INCREMENT_COUNT);
				esignVerification.setVerified(false);

				esignVerificationDao.save(esignVerification);

				esignMessageService.sendOtpMessage(target, otpCode);
			}

		}

		// Return if the verification otp sent was success or failed.
		return new ResponseEntityDto(false, OTP_SENT_SUCCESS + channel);

	}

	private ResponseEntityDto verifyCodeWithDocumentRecipient(DocumentLink documentLink, Long documentId,
			Long recipientId, String code) {

		if (code == null || code.trim().isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_VERIFICATION_CODE_INVALID);
		}

		Optional<EsignVerification> esignVerificationOptional;

		if (documentLink != null) {
			esignVerificationOptional = esignVerificationDao.findByDocument_IdAndRecipient_Id(
					documentLink.getDocumentId().getId(), documentLink.getRecipientId().getId());
		}
		else {
			esignVerificationOptional = esignVerificationDao.findByDocument_IdAndRecipient_Id(documentId, recipientId);
		}

		if (esignVerificationOptional.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_USER_VERIFICATION_NOT_FOUND);
		}

		EsignVerification esignVerification = esignVerificationOptional.get();

		if (OtpUtil.validateOTP(esignVerification.getVerificationCode(), esignVerification.getOtpExpiryTime(), code)) {

			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_OTP);
		}

		esignVerification.setVerificationCode(null);
		esignVerification.setOtpExpiryTime(null);
		esignVerification.setVerified(true);
		esignVerification.setOtpSentAttemptCount(EsignConstants.ESIGN_DEFAULT_OTP_ATTEMPT_COUNT);
		esignVerificationDao.save(esignVerification);

		return new ResponseEntityDto(false,
				messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_SUCCESS_OTP_VERIFIED));

	}

	private boolean getMfaVerificationStatus(DocumentLink documentLink, Long documentId, Long recipientId) {
		Optional<EsignVerification> esignVerification;

		if (documentLink != null) {
			esignVerification = esignVerificationDao.findByDocument_IdAndRecipient_Id(
					documentLink.getDocumentId().getId(), documentLink.getRecipientId().getId());
		}
		else {
			esignVerification = esignVerificationDao.findByDocument_IdAndRecipient_Id(documentId, recipientId);
		}

		return esignVerification.map(EsignVerification::isVerified).orElse(false);
	}

	private ResponseEntityDto handleOtpBackoffAndSend(EsignVerification existingEsignVerification, String target,
			String channel) {

		LocalDateTime lastModifiedTime = existingEsignVerification.getLastModifiedDate();
		LocalDateTime coolDownTime = lastModifiedTime.plusSeconds(30);

		// prevent any OTP send within 30 seconds
		if (LocalDateTime.now().isBefore(coolDownTime)) {
			long remainingSeconds = Duration.between(LocalDateTime.now(), coolDownTime).getSeconds();
			return new ResponseEntityDto(false, TOO_MANY_OTP_REQUESTS + remainingSeconds + RETRY_TIME_IN_SECONDS);
		}

		int currentAttempts = existingEsignVerification.getOtpSentAttemptCount();

		// Check if max attempts exceeded and apply exponential backoff
		if (currentAttempts >= EsignConstants.ESIGN_MAX_OTP_SEND_LIMIT) {
			int backoffMultiplier = (int) Math.pow(EsignConstants.ESIGN_OTP_BACKOFF_MULTIPLIER,
					currentAttempts - EsignConstants.ESIGN_MAX_OTP_SEND_LIMIT);
			int backoffSeconds = Math.min(EsignConstants.ESIGN_MIN_OTP_BACKOFF_SECONDS * backoffMultiplier,
					EsignConstants.ESIGN_MAX_OTP_BACKOFF_SECONDS);
			LocalDateTime backoffTime = lastModifiedTime.plusSeconds(backoffSeconds);

			if (LocalDateTime.now().isBefore(backoffTime)) {
				long remainingSeconds = Duration.between(LocalDateTime.now(), backoffTime).getSeconds();
				return new ResponseEntityDto(false, TOO_MANY_OTP_REQUESTS + remainingSeconds + RETRY_TIME_IN_SECONDS);
			}

			// Backoff expired - reset attempt count
			existingEsignVerification.setOtpSentAttemptCount(EsignConstants.ESIGN_DEFAULT_OTP_ATTEMPT_COUNT);
		}

		// send OTP
		String otpCode = OtpUtil.generateOTP();
		Instant expiryTime = Instant.now().plusSeconds(otpExpirySeconds);

		existingEsignVerification.setVerificationCode(otpCode);
		existingEsignVerification.setOtpExpiryTime(expiryTime);
		existingEsignVerification.setVerified(false);
		existingEsignVerification.setOtpSentAttemptCount(existingEsignVerification.getOtpSentAttemptCount()
				+ EsignConstants.ESIGN_DEFAULT_OTP_SENT_INCREMENT_COUNT);

		esignVerificationDao.save(existingEsignVerification);
		esignMessageService.sendOtpMessage(target, otpCode);

		return new ResponseEntityDto(false, OTP_SENT_SUCCESS + channel);
	}

	private DocumentLink decodeDocumentLinkFromUuid(String uuid, String state) {

		String decodedUuid = URLDecoder.decode(uuid, StandardCharsets.UTF_8);
		String decodedState = URLDecoder.decode(state, StandardCharsets.UTF_8);

		String decryptedUuid = encryptionDecryptionService.decrypt(decodedUuid, encryptSecret);
		String decryptedState = encryptionDecryptionService.decrypt(decodedState, encryptSecret);

		if (decryptedUuid == null || decryptedUuid.trim().isEmpty() || decryptedState == null
				|| decryptedState.trim().isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_INVALID_TOKEN);
		}

		String[] stateParts = decryptedState.split(EsignConstants.DOCUMENT_ACCESS_EMAIL_LINK_STATE_PATTERN);
		if (stateParts.length != 3) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_INVALID_TOKEN);
		}

		Long recipientId = Long.valueOf(stateParts[0]);
		String envelopeUUID = stateParts[1];
		String tenantId = stateParts[2];

		if (envelopeUUID == null || tenantId == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_INVALID_TOKEN);
		}

		tenantContext.setTenantAndSwitchSchema(tenantId);

		Optional<DocumentLink> documentLinkOpt = documentLinkRepository.findByUuid(decodedUuid);

		if (documentLinkOpt.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_LINK_NOT_FOUND);
		}

		DocumentLink documentLink = documentLinkOpt.get();

		if (!documentLink.getRecipientId().getId().equals(recipientId)
				|| !documentLink.getEnvelopeId().getUuid().equals(envelopeUUID)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_INVALID_TOKEN);
		}

		return documentLink;
	}

	private Recipient validateAndGetRecipient(Long documentId, Long recipientId) {
		String tenantId = TenantContext.getCurrentTenant();

		if (tenantId == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}

		Document document = documentDao.findById(documentId)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		if (document.getEnvelope() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		}

		Envelope envelope = document.getEnvelope();

		if (EnvelopeStatus.inactiveStatuses().contains(envelope.getStatus())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ACCESS_INACTIVE);
		}

		return document.getEnvelope()
			.getRecipients()
			.stream()
			.filter(rec -> rec.getId().equals(recipientId))
			.findFirst()
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));
	}

}
