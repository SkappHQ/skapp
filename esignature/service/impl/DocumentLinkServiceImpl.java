package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.JwtService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentVersionField;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.response.FieldResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldValueResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientResponseDto;
import com.skapp.enterprise.esignature.payload.response.SignLinkDataResponseDto;
import com.skapp.enterprise.esignature.payload.response.TemporaryLinkResponseDto;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.DocumentDao;
import com.skapp.enterprise.esignature.repository.DocumentVersionFieldRepository;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.repository.DocumentLinkRepository;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.type.DocumentPermissionType;
import com.skapp.enterprise.esignature.type.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentLinkServiceImpl implements DocumentLinkService {

	private final DocumentLinkRepository documentLinkRepository;

	private final JwtService jwtService;

	private final DocumentDao documentDao;

	private final AddressBookDao addressBookDao;

	private final RecipientRepository recipientRepository;

	private final EsignMapper eSignMapper;

	private final DocumentVersionFieldRepository documentVersionFieldRepository;

	private static final String BASE_SIGNING_URL = "/document/sign?token=";

	private static final String BASE_VIEW_URL = "/document/view?token=";

	@Value("${jwt.access-token.esign.temp-expiration-time}")
	private Long jwtEsignTempAccessTokenExpirationMs;

	@Value("${jwt.access-token.esign.temp-max-clicks}")
	private int defaultMaxClicks;

	@Value("${app.parent-domain}")
	private String parentDomain;

	@Override
	@Transactional
	public TemporaryLinkResponseDto generateDocumentAccessUrl(DocumentAccessUrlDto documentAccessUrlDto) {

		String tenantId = TenantContext.getCurrentTenant();
		if (tenantId == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}

		Long documentId = documentAccessUrlDto.getDocumentId();
		Long recipientId = documentAccessUrlDto.getRecipientId();

		Optional<Document> documentOptional = documentDao.findById(documentId);

		if (documentOptional.isEmpty()) {
			log.info("createTemporaryLink: Document with ID {} not found", documentId);
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND);
		}

		Envelope envelope = documentOptional.get().getEnvelope();

		Optional<Recipient> optionalUpdatableRecipient = recipientRepository.findById(recipientId);

		Recipient recipient = optionalUpdatableRecipient
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_NO_RECIPIENT_FOUND));

		documentLinkRepository.findByEnvelopeIdAndRecipientIdAndIsActiveTrue(envelope, recipient).ifPresent(link -> {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_VALID_TEMP_SIGN_LINK_AVAILABLE);
		});

		Long userId = recipient.getAddressBook().getUserId();
		String userEmail = recipient.getAddressBook().getEmail();

		UserDetails userDetails = User.builder().username(userEmail).build();

		UserType userType = recipient.getAddressBook().getType();

		LocalDateTime expiresAt = LocalDateTime.now().plus(Duration.ofMillis(jwtEsignTempAccessTokenExpirationMs));

		DocumentLink documentLink = DocumentLink.builder()
			.envelopeId(envelope)
			.recipientId(recipient)
			.createdByUserId(userId)
			.createdAt(LocalDateTime.now())
			.expiresAt(expiresAt)
			.maxClicks(defaultMaxClicks)
			.clickCount(0)
			.isActive(true)
			.build();

		documentLinkRepository.save(documentLink);

		DocumentAccessData documentAccessData = new DocumentAccessData(userId, documentLink.getId(), tenantId,
				envelope.getId(), documentId, recipientId, userType.name());

		String token;
		if (documentAccessUrlDto.getPermissionType().equals(DocumentPermissionType.WRITE)) {
			token = generateSignAccessToken(userDetails, documentAccessData);

		}
		else {
			token = generateViewAccessToken(userDetails, documentAccessData);
		}

		documentLink.setToken(token);
		documentLinkRepository.save(documentLink);

		String signUrl = generateUrl(tenantId, parentDomain);

		return TemporaryLinkResponseDto.builder()
			.token(token)
			.url(signUrl + token)
			.expiresAt(expiresAt)
			.maxClicks(defaultMaxClicks)
			.build();
	}

	@Override
	public Boolean isDocumentAccessUrlExpired(String token) {
		DocumentLink documentLink = documentLinkRepository.findByToken(token)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_LINK));

		if (documentLink.isExpired()) {
			documentLink.setActive(false);
			documentLinkRepository.save(documentLink);
			return true;
		}

		documentLink.incrementClickCount();
		documentLinkRepository.save(documentLink);

		return false;
	}

	@Override
	public ResponseEntityDto getRecipientDocumentData(@NotNull Long documentId, @NotNull Long recipientId) {

		Document document = documentDao.findById(documentId)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		if (document.getEnvelope() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		}

		Envelope envelope = document.getEnvelope();

		Recipient recipientObj = document.getEnvelope()
			.getRecipients()
			.stream()
			.filter(recipient -> recipient.getId().equals(recipientId))
			.findFirst()
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));

		DocumentLink documentLink = documentLinkRepository
			.findByEnvelopeIdAndRecipientIdAndIsActiveTrue(envelope, recipientObj)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_LINK));

		TemporaryLinkResponseDto temporaryLinkResponseDto = eSignMapper
			.temporaryLinkToTemporaryLinkResponseDto(documentLink);
		temporaryLinkResponseDto.setUrl(BASE_SIGNING_URL + temporaryLinkResponseDto.getToken());
		temporaryLinkResponseDto.setExpiresAt(documentLink.getExpiresAt());

		RecipientResponseDto recipientResponseDto = eSignMapper.recipientToRecipientResponseDto(recipientObj);

		SignLinkDataResponseDto signLinkData = getSignLinkDataResponseDto(envelope.getId(), recipientObj,
				recipientResponseDto, temporaryLinkResponseDto);

		return new ResponseEntityDto(false, signLinkData);
	}

	private SignLinkDataResponseDto getSignLinkDataResponseDto(Long envelopeId, Recipient recipientObj,
			RecipientResponseDto recipientResponseDto, TemporaryLinkResponseDto temporaryLinkResponseDto) {
		List<FieldResponseDto> fieldResponseDtoList = getFieldResponseDtos(recipientObj);

		SignLinkDataResponseDto signLinkData = new SignLinkDataResponseDto();
		signLinkData.setName(recipientObj.getAddressBook().getName());
		signLinkData.setEmail(recipientObj.getAddressBook().getEmail());
		signLinkData.setEnvelopeId(envelopeId);
		signLinkData.setRecipientResponseDto(recipientResponseDto);
		signLinkData.setFieldResponseDtoList(fieldResponseDtoList);
		signLinkData.setTemporaryLinkResponseDto(temporaryLinkResponseDto);
		return signLinkData;
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

		extraClaims.put("sub", userDetails.getUsername());
		extraClaims.put("userId", data.userId());
		extraClaims.put(EpAuthConstants.TENANT_ID, data.tenantId());
		extraClaims.put("envelopeId", data.envelopeId());
		extraClaims.put("documentId", data.documentId());
		extraClaims.put("userType", data.userType());
		extraClaims.put("recipientId", data.recipientId());
		extraClaims.put("linkId", data.linkId());
		extraClaims.put("permissions", permissions);

		return jwtService.generateTemporaryAccessToken(userDetails, extraClaims);
	}

	private String generateUrl(String tenantId, String parentDomain) {
		String protocol = parentDomain.equals("localhost") ? "http" : "https";

		return protocol + "://" + tenantId + "." + parentDomain + BASE_SIGNING_URL;
	}

	private record DocumentAccessData(Long userId, Long linkId, String tenantId, Long envelopeId, Long documentId,
			Long recipientId, String userType) {
	}

}
