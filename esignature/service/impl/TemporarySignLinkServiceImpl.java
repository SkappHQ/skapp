package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.JwtService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.DocumentVersionField;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.model.TemporarySignLink;
import com.skapp.enterprise.esignature.payload.response.FieldResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldValueResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientResponseDto;
import com.skapp.enterprise.esignature.payload.response.SignLinkDataResponseDto;
import com.skapp.enterprise.esignature.payload.response.TemporaryLinkResponseDto;
import com.skapp.enterprise.esignature.repository.DocumentVersionFieldRepository;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.repository.TemporaryLinkRepository;
import com.skapp.enterprise.esignature.service.TemporarySignLinkService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TemporarySignLinkServiceImpl implements TemporarySignLinkService {

	private final TemporaryLinkRepository temporaryLinkRepository;

	private final JwtService jwtService;

	private final EnvelopeDao envelopeDao;

	private final RecipientRepository recipientRepository;

	private final EsignMapper eSignMapper;

	private final DocumentVersionFieldRepository documentVersionFieldRepository;

	@Value("${jwt.access-token.esign.temp-expiration-time}")
	private Long jwtEsignTempAccessTokenExpirationMs;

	@Value("${jwt.access-token.esign.temp-max-clicks}")
	private int defaultMaxClicks;

	@Override
	@Transactional
	public TemporaryLinkResponseDto createTemporaryLink(@NotNull Long envelopeId, @NotNull Long recipientId) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || authentication.getPrincipal() == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		String tenantId = TenantContext.getCurrentTenant();
		if (tenantId == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}

		Optional<Envelope> envelopeOptional = envelopeDao.findById(envelopeId);

		if (envelopeOptional.isEmpty()) {
			log.info("createTemporaryLink: Envelope with ID {} not found", envelopeId);
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		}

		Envelope envelope = envelopeOptional.get();

		Optional<Recipient> optionalUpdatableRecipient = recipientRepository.findById(recipientId);

		Recipient recipient = optionalUpdatableRecipient
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_NO_RECIPIENT_FOUND));

		Long userId = (Long) authentication.getCredentials();
		UserDetails userDetails = (UserDetails) authentication.getPrincipal();
		int defaultExpirationHours = (int) (jwtEsignTempAccessTokenExpirationMs / 3600);

		TemporarySignLink temporarySignLink = TemporarySignLink.builder()
			.envelopeId(envelope)
			.recipientId(recipient)
			.createdByUserId(userId)
			.createdAt(LocalDateTime.now())
			.expiresAt(LocalDateTime.now().plusHours(defaultExpirationHours))
			.maxClicks(defaultMaxClicks)
			.clickCount(0)
			.isActive(true)
			.build();

		String token = generateTemporaryAccessToken(userDetails, userId, temporarySignLink.getId(), tenantId,
				envelopeId);

		temporarySignLink.setToken(token);
		temporaryLinkRepository.save(temporarySignLink);

		return TemporaryLinkResponseDto.builder()
			.token(token)
			.url("/v1/ep/document/sign?token=" + token)
			.expirationHours(defaultExpirationHours)
			.maxClicks(defaultMaxClicks)
			.build();
	}

	@Override
	@Transactional
	public boolean isExpired(String token) {
		TemporarySignLink temporarySignLink = temporaryLinkRepository.findByToken(token)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_LINK));

		if (temporarySignLink.isExpired()) {
			temporarySignLink.setActive(false);
			temporaryLinkRepository.save(temporarySignLink);
			return true;
		}

		temporarySignLink.incrementClickCount();
		temporaryLinkRepository.save(temporarySignLink);

		return false;
	}

	@Override
	public ResponseEntityDto getSigningLinkData(@NotNull Long envelopeId, @NotNull Long recipientId) {

		Envelope envelope = envelopeDao.findById(envelopeId)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND));

		Recipient recipientObj = envelope.getRecipients()
			.stream()
			.filter(recipient -> recipient.getId().equals(recipientId))
			.findFirst()
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));

		TemporarySignLink temporarySignLink = temporaryLinkRepository
			.findByEnvelopeIdAndRecipientId(envelope, recipientObj)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_LINK));

		TemporaryLinkResponseDto temporaryLinkResponseDto = eSignMapper
			.temporaryLinkToTemporaryLinkResponseDto(temporarySignLink);
		RecipientResponseDto recipientResponseDto = eSignMapper.recipientToRecipientResponseDto(recipientObj);

		SignLinkDataResponseDto signLinkData = getSignLinkDataResponseDto(envelopeId, recipientObj,
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

	private String generateTemporaryAccessToken(UserDetails userDetails, Long userId, Long linkId, String tenantId,
			Long envelopeId) {

		Map<String, Object> extraClaims = new HashMap<>();

		extraClaims.put("sub", userDetails.getUsername());
		extraClaims.put("userId", userId);
		extraClaims.put(EpAuthConstants.TENANT_ID, tenantId);
		extraClaims.put("envelopeId", envelopeId);
		extraClaims.put("linkId", linkId);

		return jwtService.generateTemporaryAccessToken(userDetails, extraClaims);
	}

}
