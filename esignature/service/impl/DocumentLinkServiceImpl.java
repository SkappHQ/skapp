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
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.type.TwilioMessageSource;
import com.skapp.enterprise.common.util.OtpUtil;
import com.skapp.enterprise.common.util.PhoneNumberMaskUtil;
import com.skapp.enterprise.esignature.constant.EsignConstants;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.model.DocumentVersionField;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.EsignVerificationSession;
import com.skapp.enterprise.esignature.model.EsignVerificationSessionLog;
import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.request.ResendAccessUrlDto;
import com.skapp.enterprise.esignature.payload.request.verification.RecipientConvertToOtpRequestDto;
import com.skapp.enterprise.esignature.payload.request.verification.RecipientConvertToOtpValidateRequestDto;
import com.skapp.enterprise.esignature.payload.request.verification.UuidConvertToOtpRequestDto;
import com.skapp.enterprise.esignature.payload.request.verification.UuidConvertToOtpValidateRequestDto;
import com.skapp.enterprise.esignature.payload.response.AdvanceFieldDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentAccessLinkDataResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentLinkResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentTokenResendStatusResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentTokenResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldContainerResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldValueResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientResponseDto;
import com.skapp.enterprise.esignature.repository.DocumentDao;
import com.skapp.enterprise.esignature.repository.DocumentLinkRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionDao;
import com.skapp.enterprise.esignature.repository.DocumentVersionFieldRepository;
import com.skapp.enterprise.esignature.repository.EsignVerificationSessionDao;
import com.skapp.enterprise.esignature.repository.EsignVerificationSessionLogDao;
import com.skapp.enterprise.esignature.repository.RecipientDao;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.service.EsignEmailService;
import com.skapp.enterprise.esignature.service.EsignMessageService;
import com.skapp.enterprise.esignature.service.ExternalDocumentJwtService;
import com.skapp.enterprise.esignature.type.DocumentPermissionType;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.EsignVerificationEventType;
import com.skapp.enterprise.esignature.type.EsignVerificationType;
import com.skapp.enterprise.esignature.type.FieldType;
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
import java.time.temporal.ChronoUnit;
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

	private static final String BASE_URL_PATH = "/sign/document/access";

	private static final String UUID_URL_PATH = "?uuid=";

	private static final String PHONE_URL_PATH = "&phone=";

	private static final String URL_PATH_MFA = "/mfa-verify";

	private static final String ROLE_DOC_ACCESS = "ROLE_DOC_ACCESS";

	public static final String STATE_STRING = "&state=";

	private static final String SMS_VERIFICATION_CHANNEL = "sms";

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

	private final EsignVerificationSessionDao esignVerificationSessionDao;

	private final EsignVerificationSessionLogDao esignVerificationSessionLogDao;

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

	@Value("${aws.cloudfront.s3-default.domain-name}")
	private String cloudFrontDomain;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

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

		String encryptedUuid = encryptionDecryptionService.encrypt(tokenUuid);
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

		if (isVerificationEnabled && !getMfaVerificationStatus(null, documentId, recipientId)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MFA_NOT_VALIDATED);
		}

		validateTokenFlows(isDocAccess, recipient, documentId);

		RecipientResponseDto recipientResponseDto = eSignMapper.recipientToRecipientResponseDto(recipient);

		if (recipient.getAddressBook().getMySignatureLink() != null) {
			recipientResponseDto.getAddressBook()
				.setMySignatureLink(EpCommonConstants.HTTPS_PROTOCOL + cloudFrontDomain + "/"
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

		if (isVerificationEnabled && !getMfaVerificationStatus(documentLink, null, null)) {
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
	public ResponseEntityDto sendOtpFromUuid(UuidConvertToOtpRequestDto uuidConvertToOtpRequestDto) {

		DocumentLink documentLink = decodeDocumentLinkFromUuid(uuidConvertToOtpRequestDto.getUuid(),
				uuidConvertToOtpRequestDto.getState());

		return sendVerificationToRecipient(documentLink, null, null, false);
	}

	@Override
	public ResponseEntityDto sendOtpFromDocumentAndRecipientId(
			RecipientConvertToOtpRequestDto recipientConvertToOtpRequestDto) {

		Recipient recipient = validateAndGetRecipient(recipientConvertToOtpRequestDto.getDocumentId(),
				recipientConvertToOtpRequestDto.getRecipientId());

		validateTokenFlows(false, recipient, recipientConvertToOtpRequestDto.getDocumentId());

		Document document = documentDao.findById(recipientConvertToOtpRequestDto.getDocumentId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		// MFA Flow: Send OTP and return verification initiated response
		return sendVerificationToRecipient(null, document, recipient, false);

	}

	@Override
	public ResponseEntityDto verifyOtpFromUuid(UuidConvertToOtpValidateRequestDto uuidConvertToOtpValidateRequestDto) {

		DocumentLink documentLink = decodeDocumentLinkFromUuid(uuidConvertToOtpValidateRequestDto.getUuid(),
				uuidConvertToOtpValidateRequestDto.getState());

		// Verify the OTP
		return verifyCodeWithDocumentRecipient(documentLink, null, null, uuidConvertToOtpValidateRequestDto.getCode());

	}

	@Override
	public ResponseEntityDto verifyOtpFromDocumentAndRecipientId(
			RecipientConvertToOtpValidateRequestDto recipientConvertToOtpValidateRequestDto) {

		Recipient recipient = validateAndGetRecipient(recipientConvertToOtpValidateRequestDto.getDocumentId(),
				recipientConvertToOtpValidateRequestDto.getRecipientId());

		validateTokenFlows(false, recipient, recipientConvertToOtpValidateRequestDto.getDocumentId());

		// Verify the OTP
		return verifyCodeWithDocumentRecipient(null, recipientConvertToOtpValidateRequestDto.getDocumentId(),
				recipientConvertToOtpValidateRequestDto.getRecipientId(),
				recipientConvertToOtpValidateRequestDto.getCode());

	}

	@Override
	public ResponseEntityDto resendOtpFromUuid(UuidConvertToOtpRequestDto uuidConvertToOtpRequestDto,
			boolean isResend) {

		DocumentLink documentLink = decodeDocumentLinkFromUuid(uuidConvertToOtpRequestDto.getUuid(),
				uuidConvertToOtpRequestDto.getState());

		return sendVerificationToRecipient(documentLink, null, null, isResend);

	}

	@Override
	public ResponseEntityDto resendOtpFromDocumentAndRecipientId(
			RecipientConvertToOtpRequestDto recipientConvertToOtpRequestDto, boolean isResend) {

		Recipient recipient = validateAndGetRecipient(recipientConvertToOtpRequestDto.getDocumentId(),
				recipientConvertToOtpRequestDto.getRecipientId());

		validateTokenFlows(false, recipient, recipientConvertToOtpRequestDto.getDocumentId());

		Document document = documentDao.findById(recipientConvertToOtpRequestDto.getDocumentId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		return sendVerificationToRecipient(null, document, recipient, isResend);
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
		dto.setFilePath(EpCommonConstants.HTTPS_PROTOCOL + cloudFrontDomain + "/"
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

		List<FieldContainerResponseDto> fieldContainerResponseList = permissionType == DocumentPermissionType.WRITE
				? getFieldContainerResponseDtos(recipient) : Collections.emptyList();

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
		documentAccessLinkData.setAdvanceFieldContainerResponseDtoList(fieldContainerResponseList);
		return documentAccessLinkData;
	}

	private List<FieldResponseDto> getFieldResponseDtos(Recipient recipientObj) {
		List<Field> fields = recipientObj.getFields();
		List<FieldResponseDto> fieldResponseDtoList = new ArrayList<>();

		fields.stream()
			.filter(field -> !(field.getType().equals(FieldType.TEXT) || field.getType().equals(FieldType.DROPDOWN)
					|| field.getType().equals(FieldType.CHECKBOX) || field.getType().equals(FieldType.RADIO_BUTTON)))
			.forEach(field -> {
				FieldResponseDto fieldResponseDto = eSignMapper.fieldToFieldResponseDto(field);
				DocumentVersionField documentVersionField = documentVersionFieldRepository.findByField(field);
				FieldValueResponseDto fieldValueResponseDto = eSignMapper
					.documentVersionFieldToFieldValueResponseDto(documentVersionField);
				fieldResponseDto.setFieldValueResponseDto(fieldValueResponseDto);
				fieldResponseDtoList.add(fieldResponseDto);
			});
		return fieldResponseDtoList;
	}

	private List<FieldContainerResponseDto> getFieldContainerResponseDtos(Recipient recipientObj) {
		List<Field> fields = recipientObj.getFields();
		List<FieldContainerResponseDto> fieldContainerResponseDtoList = new ArrayList<>();

		fields.stream()
			.filter(field -> field.getFieldContainer() != null)
			.map(Field::getFieldContainer)
			.distinct()
			.forEach(fieldContainer -> {
				FieldContainerResponseDto fieldContainerResponseDto = eSignMapper
					.fieldContainerToFieldContainerResponseDto(fieldContainer);

				// Collect fields for this container (TEXT, CHECKBOX, RADIO_BUTTON, etc.)
				List<AdvanceFieldDetailResponseDto> containerFields = fields.stream()
					.filter(f -> fieldContainer.equals(f.getFieldContainer()))
					.filter(f -> f.getType().equals(FieldType.TEXT) || f.getType().equals(FieldType.DROPDOWN)
							|| f.getType().equals(FieldType.CHECKBOX) || f.getType().equals(FieldType.RADIO_BUTTON))
					.map(eSignMapper::fieldToAdvanceFieldDetailResponseDto)
					.toList();

				fieldContainerResponseDto.setFields(containerFields);
				fieldContainerResponseDtoList.add(fieldContainerResponseDto);
			});

		return fieldContainerResponseDtoList;
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

		String encryptedState = encryptionDecryptionService.encrypt(state);
		String encodedState = URLEncoder.encode(encryptedState, StandardCharsets.UTF_8);

		String encodedEncryptedUUID = URLEncoder.encode(uuid, StandardCharsets.UTF_8);

		String baseUrlPath = BASE_URL_PATH;

		String mfaRecipientDetails = getMFARecipientDetails(recipientId);

		if (mfaRecipientDetails != null) {
			// MFA enabled:
			// /sign/document/access/mfa-verify?uuid={uuid}&state={state}&phone={phone}
			return protocol + "://" + tenantId + "." + parentDomain + baseUrlPath + URL_PATH_MFA + UUID_URL_PATH
					+ encodedEncryptedUUID + STATE_STRING + encodedState + PHONE_URL_PATH + mfaRecipientDetails;
		}

		// MFA disabled: /sign/document/access?uuid={uuid}&state={state}
		return protocol + "://" + tenantId + "." + parentDomain + baseUrlPath + UUID_URL_PATH + encodedEncryptedUUID
				+ STATE_STRING + encodedState;
	}

	private String getMFARecipientDetails(Long recipientId) {

		Optional<Recipient> recipientOptional = recipientDao.findById(recipientId);
		Recipient recipient = recipientOptional
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));

		if (recipient.isMfaVerificationEnabled()) {
			populateAndSaveVerificationSessionData(recipient);
		}

		EsignVerificationType verificationMethod = recipient.getMfaVerificationMethod();

		if (verificationMethod.equals(EsignVerificationType.SMS)) {
			String recipientPhone = recipientDao.findPhoneByRecipientId(recipientId);

			if (recipientPhone == null || recipientPhone.isEmpty()) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_CONTACT_NO_NOT_FOUND);

			}

			return PhoneNumberMaskUtil.mask(recipientPhone);
		}
		else {
			return null;
		}

	}

	private void populateAndSaveVerificationSessionData(Recipient recipient) {

		Document document = recipient.getEnvelope()
			.getDocuments()
			.stream()
			.findFirst()
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		EsignVerificationSession existingVerificationSession = esignVerificationSessionDao
			.findByDocument_IdAndRecipient_Id(document.getId(), recipient.getId())
			.orElse(null);

		if (existingVerificationSession == null) {
			EsignVerificationSession esignVerificationSession = new EsignVerificationSession();
			esignVerificationSession.setRecipient(recipient);
			esignVerificationSession.setDocument(document);
			esignVerificationSession.setVerified(false);

			esignVerificationSessionDao.save(esignVerificationSession);
		}

	}

	private record DocumentAccessData(Long userId, String tenantId, Long envelopeId, Long documentId, Long recipientId,
			String userType) {
	}

	private boolean validateMfaVerificationEnable(Recipient recipient) {
		return recipient.isMfaVerificationEnabled();
	}

	private ResponseEntityDto sendVerificationToRecipient(DocumentLink documentLink, Document document,
			Recipient recipient, boolean isResend) {

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

			// Check if there's an existing active otp session to the recipient for this
			// document.
			EsignVerificationSession verificationSession = esignVerificationSessionDao
				.findByDocumentIdAndRecipientIdForUpdate(documentData.getId(), recipientData.getId());

			if (verificationSession == null) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_VERIFICATION_NOT_FOUND);
			}

			if (verificationSession.getVerificationCode() != null) {
				return handleOtpBackoffAndSend(verificationSession, target, channel, isResend);
			}
			else {
				String otpCode = OtpUtil.generateOTP();
				Instant expiryTime = Instant.now().plusSeconds(EsignConstants.OTP_EXPIRY_TIME_SECONDS);

				verificationSession.setRecipient(recipientData);
				verificationSession.setDocument(documentData);
				verificationSession.setVerificationCode(otpCode);
				verificationSession.setVerified(false);
				verificationSession.setOtpExpiryTime(expiryTime);
				verificationSession.setOtpCreatedTime(Instant.now());
				verificationSession.setConcurrentAccessCount(1);
				esignVerificationSessionDao.save(verificationSession);

				populateAndSaveVerificationSessionHistoryData(recipientData.getId(), documentData.getId(),
						EsignVerificationEventType.OTP_GENERATED, Instant.now(),
						verificationSession.getConcurrentAccessCount(), 0, 0);

				esignMessageService.sendOtpMessage(target, otpCode, TwilioMessageSource.ESIGN_MFA,
						recipientData.getId());
			}

		}

		// Return if the verification otp sent was success or failed.
		return new ResponseEntityDto(false, EsignMessageConstant.ESIGN_RESPONSE_VERIFICATION_OTP_SENT_VIA_SMS);

	}

	private void populateAndSaveVerificationSessionHistoryData(Long recipientId, Long documentId,
			EsignVerificationEventType eventType, Instant timestamp, int concurrentSessionCount, int attemptNumber,
			int resendNumber) {

		EsignVerificationSessionLog esignVerificationSessionLog = new EsignVerificationSessionLog();
		esignVerificationSessionLog.setRecipientId(recipientId);
		esignVerificationSessionLog.setDocumentId(documentId);
		esignVerificationSessionLog.setEventType(eventType);
		esignVerificationSessionLog.setTimestamp(timestamp);
		esignVerificationSessionLog.setConcurrentAccessCount(concurrentSessionCount);
		esignVerificationSessionLog.setAttemptNumber(attemptNumber);
		esignVerificationSessionLog.setResendNumber(resendNumber);

		esignVerificationSessionLogDao.save(esignVerificationSessionLog);

	}

	private ResponseEntityDto verifyCodeWithDocumentRecipient(DocumentLink documentLink, Long documentId,
			Long recipientId, String code) {

		if (documentLink == null && (documentId == null || recipientId == null)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_INPUTS_FOR_OTP_VERIFICATION);
		}

		if (code == null || code.trim().isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_VERIFICATION_CODE_INVALID);
		}

		recipientId = recipientId != null ? recipientId : documentLink.getRecipientId().getId();
		documentId = documentId != null ? documentId : documentLink.getDocumentId().getId();

		EsignVerificationSession esignVerification = esignVerificationSessionDao
			.findByDocumentIdAndRecipientIdForUpdate(documentId, recipientId);

		if (esignVerification == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_USER_VERIFICATION_NOT_FOUND);
		}

		Instant timeNow = Instant.now();

		String remainingTimeInSeconds;

		// Reset verification lockout level if reset period passed
		if (esignVerification.getVerificationLockoutResetTime() != null
				&& timeNow.isAfter(esignVerification.getVerificationLockoutResetTime())) {
			esignVerification.setVerificationLockoutLevel(0);
			esignVerification.setVerificationLockoutResetTime(null);
		}

		// Apply 3-second rate limit between attempts
		Instant lastAttemptTime = esignVerification.getLastAttemptedTime();
		if (lastAttemptTime != null) {
			Instant nextAllowedAttempt = lastAttemptTime.plusSeconds(EsignConstants.MIN_VERIFICATION_BACKOFF_SECONDS);
			if (timeNow.isBefore(nextAllowedAttempt)) {

				EsignVerificationEventType eventType = EsignVerificationEventType.OTP_SESSION_LOCKED;
				populateAndSaveVerificationSessionHistoryData(recipientId, documentId, eventType, timeNow,
						esignVerification.getConcurrentAccessCount(), esignVerification.getAttemptCount(),
						esignVerification.getResendCount());

				remainingTimeInSeconds = String.valueOf(Duration.between(timeNow, nextAllowedAttempt).getSeconds());

				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_VERIFICATION_COOLDOWN_LOCK,
						new String[] { remainingTimeInSeconds });
			}
		}

		// Progressive lockout check
		if (esignVerification.getAttemptCount() >= EsignConstants.MAX_RETRY_LIMIT) {
			int lockoutLevel = Math.min(esignVerification.getVerificationLockoutLevel(),
					EsignConstants.VERIFICATION_PROGRESSIVE_LOCKOUT_TIMES.length - 1);
			int lockoutSeconds = EsignConstants.VERIFICATION_PROGRESSIVE_LOCKOUT_TIMES[lockoutLevel];

			Instant lockoutUntil = esignVerification.getLastAttemptedTime().plusSeconds(lockoutSeconds);

			if (timeNow.isBefore(lockoutUntil)) {

				EsignVerificationEventType eventType = EsignVerificationEventType.OTP_SESSION_LOCKED;
				populateAndSaveVerificationSessionHistoryData(recipientId, documentId, eventType, timeNow,
						esignVerification.getConcurrentAccessCount(), esignVerification.getAttemptCount(),
						esignVerification.getResendCount());

				remainingTimeInSeconds = String.valueOf(Duration.between(timeNow, lockoutUntil).getSeconds());

				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_VERIFICATION_BLOCKED,
						new String[] { remainingTimeInSeconds });
			}

			// Lockout expired - increase level and reset counters
			esignVerification.setVerificationLockoutLevel(lockoutLevel + 1);
			esignVerification.setAttemptCount(0);
			esignVerification.setVerificationLockoutResetTime(
					timeNow.plus(EsignConstants.VERIFICATION_LOCKOUT_LEVEL_RESET_DAYS, ChronoUnit.DAYS));
			esignVerificationSessionDao.save(esignVerification);
		}

		EsignVerificationEventType eventType;

		// Validate OTP
		if (OtpUtil.validateOTP(esignVerification.getVerificationCode(), esignVerification.getOtpExpiryTime(), code)) {
			// Invalid OTP - increment attempt count
			esignVerification.setAttemptCount(esignVerification.getAttemptCount() + 1);
			esignVerification.setLastAttemptedTime(timeNow);

			// Initialize lockout tracking
			if (esignVerification.getVerificationLockoutResetTime() == null) {
				esignVerification.setVerificationLockoutLevel(0);
				esignVerification.setVerificationLockoutResetTime(
						timeNow.plus(EsignConstants.VERIFICATION_LOCKOUT_LEVEL_RESET_DAYS, ChronoUnit.DAYS));
			}

			esignVerificationSessionDao.save(esignVerification);

			eventType = EsignVerificationEventType.OTP_VERIFY_FAILED;

			populateAndSaveVerificationSessionHistoryData(recipientId, documentId, eventType, timeNow,
					esignVerification.getConcurrentAccessCount(), esignVerification.getAttemptCount(),
					esignVerification.getResendCount());

			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_OTP);
		}

		// Valid OTP - reset all counters
		esignVerification.setVerificationCode(null);
		esignVerification.setOtpExpiryTime(null);
		esignVerification.setVerified(true);
		esignVerification.setLastAttemptedTime(timeNow);
		esignVerification.setAttemptCount(0);
		esignVerification.setResendCount(0);
		esignVerification.setConcurrentAccessCount(0);
		esignVerification.setVerificationLockoutLevel(0);
		esignVerification.setVerificationLockoutResetTime(null);
		esignVerificationSessionDao.save(esignVerification);

		eventType = EsignVerificationEventType.OTP_VERIFY_SUCCESS;

		populateAndSaveVerificationSessionHistoryData(recipientId, documentId, eventType, timeNow,
				esignVerification.getConcurrentAccessCount(), esignVerification.getAttemptCount(),
				esignVerification.getResendCount());

		return new ResponseEntityDto(false,
				messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_SUCCESS_OTP_VERIFIED));
	}

	private boolean getMfaVerificationStatus(DocumentLink documentLink, Long documentId, Long recipientId) {
		Optional<EsignVerificationSession> esignVerification;

		if (documentLink != null) {
			esignVerification = esignVerificationSessionDao.findByDocument_IdAndRecipient_Id(
					documentLink.getDocumentId().getId(), documentLink.getRecipientId().getId());
		}
		else {
			esignVerification = esignVerificationSessionDao.findByDocument_IdAndRecipient_Id(documentId, recipientId);
		}

		if (esignVerification.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_USER_VERIFICATION_NOT_FOUND);
		}

		return esignVerification.get().isVerified();
	}

	private ResponseEntityDto handleOtpBackoffAndSend(EsignVerificationSession verificationSession, String target,
			String channel, boolean isResend) {

		EsignVerificationEventType eventType;

		Instant lastOtpCreatedTime = verificationSession.getOtpCreatedTime();
		Instant coolDownTime = lastOtpCreatedTime.plusSeconds(EsignConstants.MIN_OTP_BACKOFF_SECONDS);
		Instant timeNow = Instant.now();

		int currentResendCount = verificationSession.getResendCount();
		int currentAttemptCount = verificationSession.getAttemptCount();
		int concurrentSessionCount = verificationSession.getConcurrentAccessCount();

		String remainingTimeInSeconds;

		// Reset lockout level
		if (verificationSession.getLockoutLevelResetTime() != null
				&& timeNow.isAfter(verificationSession.getLockoutLevelResetTime())) {
			verificationSession.setLockoutLevel(0);
			verificationSession.setLockoutLevelResetTime(null);
		}

		// Apply 30-second cooldown
		if (timeNow.isBefore(coolDownTime)) {
			eventType = EsignVerificationEventType.OTP_GENERATION_LOCKED;
			populateAndSaveVerificationSessionHistoryData(verificationSession.getRecipient().getId(),
					verificationSession.getDocument().getId(), eventType, timeNow, concurrentSessionCount,
					currentAttemptCount, currentResendCount);

			remainingTimeInSeconds = String.valueOf(Duration.between(timeNow, coolDownTime).getSeconds());

			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_OTP_GENERATION_COOLDOWN_LOCK,
					new String[] { remainingTimeInSeconds });
		}

		// Progressive lockout checks BOTH resend AND concurrent count
		if (currentResendCount >= EsignConstants.MAX_RETRY_LIMIT
				|| concurrentSessionCount >= EsignConstants.MAX_RETRY_LIMIT) {
			int lockoutLevel = Math.min(verificationSession.getLockoutLevel(),
					EsignConstants.PROGRESSIVE_LOCKOUT_TIMES.length - 1);
			int lockoutSeconds = EsignConstants.PROGRESSIVE_LOCKOUT_TIMES[lockoutLevel];

			Instant lockoutUntil = lastOtpCreatedTime.plusSeconds(lockoutSeconds);

			if (timeNow.isBefore(lockoutUntil)) {

				eventType = EsignVerificationEventType.OTP_SESSION_LOCKED;
				populateAndSaveVerificationSessionHistoryData(verificationSession.getRecipient().getId(),
						verificationSession.getDocument().getId(), eventType, timeNow, concurrentSessionCount,
						currentAttemptCount, currentResendCount);

				remainingTimeInSeconds = String.valueOf(Duration.between(timeNow, lockoutUntil).getSeconds());
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_OTP_GENERATION_BLOCKED,
						new String[] { remainingTimeInSeconds });

			}

			// Save after level increase
			verificationSession.setLockoutLevel(lockoutLevel + 1);
			verificationSession.setResendCount(0);
			verificationSession.setConcurrentAccessCount(0);
			verificationSession
				.setLockoutLevelResetTime(timeNow.plus(EsignConstants.LOCKOUT_LEVEL_RESET_DAYS, ChronoUnit.DAYS));
			esignVerificationSessionDao.save(verificationSession);
		}

		// Check access count
		Instant accessBlockTime = lastOtpCreatedTime.plusSeconds(EsignConstants.OTP_DEFAULT_LOCK_TIME);
		if (concurrentSessionCount >= EsignConstants.MAX_RETRY_LIMIT && timeNow.isBefore(accessBlockTime)) {
			eventType = EsignVerificationEventType.OTP_SESSION_LOCKED;
			populateAndSaveVerificationSessionHistoryData(verificationSession.getRecipient().getId(),
					verificationSession.getDocument().getId(), eventType, timeNow, concurrentSessionCount,
					currentAttemptCount, currentResendCount);

			remainingTimeInSeconds = String.valueOf(Duration.between(timeNow, accessBlockTime).getSeconds());

			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_VERIFICATION_DOCUMENT_ACCESS_BLOCKED,
					new String[] { remainingTimeInSeconds });
		}

		// Explicitly invalidate previous OTP
		verificationSession.setVerificationCode(null);
		verificationSession.setOtpExpiryTime(null);

		// Update counters
		if (isResend) {
			eventType = EsignVerificationEventType.OTP_RESENT;
			verificationSession.setResendCount(verificationSession.getResendCount() + 1);
		}
		else {
			eventType = EsignVerificationEventType.OTP_GENERATED;

			int newCount = timeNow.isAfter(accessBlockTime) ? 1 : verificationSession.getConcurrentAccessCount() + 1;

			verificationSession.setConcurrentAccessCount(newCount);
		}

		// Generate new OTP
		String otpCode = OtpUtil.generateOTP();
		Instant expiryTime = timeNow.plusSeconds(EsignConstants.OTP_EXPIRY_TIME_SECONDS);

		verificationSession.setVerificationCode(otpCode);
		verificationSession.setVerified(false);
		verificationSession.setOtpExpiryTime(expiryTime);
		verificationSession.setOtpCreatedTime(timeNow);

		EsignVerificationSession savedVerificationSession = esignVerificationSessionDao.save(verificationSession);

		populateAndSaveVerificationSessionHistoryData(savedVerificationSession.getRecipient().getId(),
				savedVerificationSession.getDocument().getId(), eventType, timeNow,
				savedVerificationSession.getConcurrentAccessCount(), savedVerificationSession.getAttemptCount(),
				savedVerificationSession.getResendCount());

		esignMessageService.sendOtpMessage(target, otpCode, TwilioMessageSource.ESIGN_MFA,
				verificationSession.getRecipient().getId());

		return new ResponseEntityDto(false, EsignMessageConstant.ESIGN_RESPONSE_VERIFICATION_OTP_SENT_VIA_SMS);
	}

	private DocumentLink decodeDocumentLinkFromUuid(String uuid, String state) {

		String decodedUuid = URLDecoder.decode(uuid, StandardCharsets.UTF_8);
		String decodedState = URLDecoder.decode(state, StandardCharsets.UTF_8);

		String decryptedUuid = encryptionDecryptionService.decrypt(decodedUuid);
		String decryptedState = encryptionDecryptionService.decrypt(decodedState);

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
