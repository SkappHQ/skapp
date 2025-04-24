package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.model.DocumentVersionField;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.response.DocumentAccessLinkDataResponseDto;
import com.skapp.enterprise.esignature.payload.request.ResendAccessUrlDto;
import com.skapp.enterprise.esignature.payload.response.DocumentDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentLinkResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldValueResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientResponseDto;
import com.skapp.enterprise.esignature.repository.DocumentDao;
import com.skapp.enterprise.esignature.repository.DocumentLinkRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionFieldRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionRepository;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.service.EsignEmailService;
import com.skapp.enterprise.esignature.service.ExternalDocumentJwtService;
import com.skapp.enterprise.esignature.type.DocumentPermissionType;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.UserType;
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

import java.time.Duration;
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

	private final DocumentLinkRepository documentLinkRepository;

	private final ExternalDocumentJwtService jwtService;

	private final EsignEmailService emailService;

	private final DocumentDao documentDao;

	private final RecipientRepository recipientRepository;

	private final EsignMapper eSignMapper;

	private final DocumentVersionFieldRepository documentVersionFieldRepository;

	private final DocumentVersionRepository documentVersionRepository;

	private static final String URL_PATH = "/sign/document/access?token=";

	private static final String DOCUMENT_ID_PARAM = "documentId";

	private static final String RECIPIENT_ID_PARAM = "recipientId";

	@Value("${jwt.access-token.esign.expiration-time}")
	private Long jwtDocumentAccessTokenExpirationMs;

	@Value("${jwt.access-token.esign.max-clicks}")
	private int defaultMaxClicks;

	@Value("${app.parent-domain}")
	private String parentDomain;

	@Value("${app.protocol}")
	private String protocol;

	public static final String SUB = "sub";

	public static final String USER_ID = "userId";

	public static final String TENANT_ID = "tenantId";

	public static final String ENVELOPE_ID = "envelopeId";

	public static final String DOCUMENT_ID = "documentId";

	public static final String USER_TYPE = "userType";

	public static final String RECIPIENT_ID = "recipientId";

	public static final String TOKEN = "token";

	public static final String PERMISSION = "permission";

	private static final String ROLE_DOC_ACCESS = "ROLE_DOC_ACCESS";

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

		Optional<Recipient> optionalUpdatableRecipient = recipientRepository.findById(recipientId);

		Recipient recipient = optionalUpdatableRecipient
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));

		documentLinkRepository.findByEnvelopeIdAndRecipientIdAndIsActiveTrue(envelope, recipient).ifPresent(link -> {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_VALID_DOCUMENT_SIGN_LINK_AVAILABLE);
		});

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
	public void resendDocumentAccessURL(ResendAccessUrlDto resendAccessUrlDto) {

		log.info("resendDocumentAccessURL: process started");

		DocumentLink documentLink = documentLinkRepository.findByToken(resendAccessUrlDto.getToken())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ACCESS_LINK_INVALID));

		if (documentLink.isResend()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ACCESS_LINK_ALREADY_RESEND);
		}

		String token = resendAccessUrlDto.getToken();
		Long documentId = jwtService.extractClaim(token, claims -> claims.get(DOCUMENT_ID_PARAM, Long.class));
		Long recipientId = jwtService.extractClaim(token, claims -> claims.get(RECIPIENT_ID_PARAM, Long.class));
		List<String> permissions = jwtService.extractClaim(token, claims -> claims.get(PERMISSION, List.class));

		if (!documentId.equals(documentLink.getDocumentId().getId())
				|| !recipientId.equals(documentLink.getRecipientId().getId())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_OR_EXPIRED_LINK);
		}

		DocumentPermissionType permissionType = DocumentPermissionType.READ;

		if (permissions != null && permissions.contains("document:write")) {
			permissionType = DocumentPermissionType.WRITE;
		}

		DocumentAccessUrlDto documentAccessUrlDto = new DocumentAccessUrlDto(documentId, recipientId, permissionType);

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

		String accessUrl = generateAccessUrl(tenantId, token);
		documentLink.setToken(token);

		return new DocumentLinkData(documentLink, accessUrl);
	}

	@Override
	public DocumentLink setDocumentAccessUrlProperties(DocumentLink documentLink) {

		if (documentLink.isExpired()) {
			documentLink.setActive(false);
			documentLink = documentLinkRepository.save(documentLink);
			return documentLink;
		}

		documentLink.incrementClickCount();
		documentLink = documentLinkRepository.save(documentLink);
		return documentLink;
	}

	@Override
	public ResponseEntityDto getRecipientDocumentData(@NotNull Long documentId, @NotNull Long recipientId) {

		String tenantId = TenantContext.getCurrentTenant();

		if (tenantId == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}

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

			Document document = documentDao.findById(documentId)
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

			if (document.getEnvelope() == null) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
			}

			Envelope envelope = document.getEnvelope();

			if (EnvelopeStatus.inactiveStatuses().contains(envelope.getStatus())) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ACCESS_INACTIVE);
			}

			Recipient recipientObj = document.getEnvelope()
				.getRecipients()
				.stream()
				.filter(recipient -> recipient.getId().equals(recipientId))
				.findFirst()
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));

			DocumentLink documentLink = documentLinkRepository.findByToken(token)
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_OR_EXPIRED_LINK));

			boolean isValidDocument = Objects.equals(documentLink.getDocumentId().getId(), documentId);
			boolean isValidRecipient = Objects.equals(documentLink.getRecipientId().getId(), recipientId);

			if (!isValidDocument || !isValidRecipient) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_DOCUMENT_LINK);
			}

			DocumentLinkResponseDto documentLinkResponseDto = eSignMapper
				.documentLinkToDocumentLinkResponseDto(documentLink);
			documentLinkResponseDto.setUrl(generateAccessUrl(tenantId, documentLinkResponseDto.getToken()));
			documentLinkResponseDto.setExpiresAt(documentLink.getExpiresAt());

			RecipientResponseDto recipientResponseDto = eSignMapper.recipientToRecipientResponseDto(recipientObj);

			int versionNumber = document.getCurrentVersion();
			DocumentVersion documentVersion;

			if (versionNumber < 0) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND);
			}

			if (versionNumber != 0) {
				documentVersion = documentVersionRepository.findByVersionNumberAndDocumentId(versionNumber, documentId)
					.orElseThrow(
							() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));
			}
			else {
				documentVersion = new DocumentVersion();
				documentVersion.setFilePath(document.getFilePath());
			}

			DocumentDetailResponseDto latestDocumentDetailsDto = getLatestDocumentDetails(document, documentVersion);

			DocumentAccessLinkDataResponseDto documentAccessLinkData = getDocumentAccessLinkDataResponseDto(
					envelope.getId(), recipientObj, recipientResponseDto, documentLinkResponseDto,
					latestDocumentDetailsDto);

			documentLink = setDocumentAccessUrlProperties(documentLink);

			documentAccessLinkData.getDocumentLinkResponseDto().setClickCount(documentLink.getClickCount());

			return new ResponseEntityDto(false, documentAccessLinkData);
		}
		catch (Exception ex) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_DOCUMENT_LINK);
		}
	}

	private DocumentDetailResponseDto getLatestDocumentDetails(Document document, DocumentVersion documentVersion) {
		DocumentDetailResponseDto dto = new DocumentDetailResponseDto();
		dto.setId(document.getId());
		dto.setName(document.getName());
		dto.setFilePath(documentVersion.getFilePath());
		return dto;
	}

	private DocumentAccessLinkDataResponseDto getDocumentAccessLinkDataResponseDto(Long envelopeId,
			Recipient recipientObj, RecipientResponseDto recipientResponseDto,
			DocumentLinkResponseDto documentLinkResponseDto, DocumentDetailResponseDto documentDetailResponseDto) {
		List<FieldResponseDto> fieldResponseDtoList = getFieldResponseDtos(recipientObj);

		DocumentAccessLinkDataResponseDto documentAccessLinkData = new DocumentAccessLinkDataResponseDto();
		documentAccessLinkData.setName(recipientObj.getAddressBook().getName());
		documentAccessLinkData.setEmail(recipientObj.getAddressBook().getEmail());
		documentAccessLinkData.setEnvelopeId(envelopeId);
		documentAccessLinkData.setRecipientResponseDto(recipientResponseDto);
		documentAccessLinkData.setFieldResponseDtoList(fieldResponseDtoList);
		documentAccessLinkData.setDocumentLinkResponseDto(documentLinkResponseDto);
		documentAccessLinkData.setDocumentDetailResponseDto(documentDetailResponseDto);
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
				new String[] { DocumentPermissionType.READ.getValue(), DocumentPermissionType.WRITE.getValue() });
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

	private String generateAccessUrl(String tenantId, String token) {
		return protocol + "://" + tenantId + "." + parentDomain + URL_PATH + token;
	}

	private record DocumentAccessData(Long userId, String tenantId, Long envelopeId, Long documentId, Long recipientId,
			String userType) {
	}

}
