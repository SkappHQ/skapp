package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.constant.EidMessageConstant;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.eid.EidProvider;
import com.skapp.enterprise.esignature.eid.EidProviderRegistry;
import com.skapp.enterprise.esignature.mapper.EidMapper;
import com.skapp.enterprise.esignature.model.EidVerificationSession;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.eid.InitiateVerificationRequestDto;
import com.skapp.enterprise.esignature.payload.response.eid.AvailableProviderResponseDto;
import com.skapp.enterprise.esignature.payload.response.eid.VerificationInitiationResponseDto;
import com.skapp.enterprise.esignature.payload.response.eid.VerificationStatusResponseDto;
import com.skapp.enterprise.esignature.repository.EidVerificationSessionRepository;
import com.skapp.enterprise.esignature.repository.RecipientDao;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.service.EidVerificationService;
import com.skapp.enterprise.esignature.type.EidVerificationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of EidVerificationService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EidVerificationServiceImpl implements EidVerificationService {

	private final EidProviderRegistry providerRegistry;

	private final EidVerificationSessionRepository sessionRepository;

	private final EidMapper eidMapper;

	private final RecipientDao recipientDao;

	private final DocumentLinkService documentLinkService;

	@Override
	public ResponseEntityDto getAvailableProviders() {
		log.info("getAvailableProviders: execution started");

		List<AvailableProviderResponseDto> providers = providerRegistry.getEnabledProviders()
			.stream()
			.map(provider -> AvailableProviderResponseDto.builder()
				.providerType(provider.getProviderType())
				.displayName(provider.getDisplayName())
				.enabled(provider.isEnabled())
				.locale(provider.getProviderType().getLocale())
				.frontendConfig(provider.getFrontendConfig())
				.build())
			.toList();

		log.info("getAvailableProviders: returning {} providers", providers.size());
		return new ResponseEntityDto(false, providers);
	}

	@Override
	@Transactional
	public ResponseEntityDto initiateVerification(InitiateVerificationRequestDto request, String endUserIp) {
		log.info("initiateVerification: starting for recipient={}, document={}, provider={}", request.getRecipientId(),
				request.getDocumentId(), request.getProviderType());

		// Validate that the current user has permission to initiate verification for this
		// recipient/document
		Recipient recipient = recipientDao.findById(request.getRecipientId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));

		boolean isDocAccess = isCurrentUserDocAccessRole();
		documentLinkService.validateTokenFlows(isDocAccess, recipient, request.getDocumentId());

		// Get the provider
		EidProvider provider = providerRegistry.getProvider(request.getProviderType())
			.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_ERROR_PROVIDER_NOT_FOUND));

		if (!provider.isEnabled()) {
			throw new ModuleException(EidMessageConstant.EID_ERROR_PROVIDER_NOT_ENABLED);
		}

		// Check for existing active session
		sessionRepository
			.findFirstByRecipientIdAndDocumentIdOrderByInitiatedAtDesc(request.getRecipientId(),
					request.getDocumentId())
			.filter(this::isSessionActive)
			.ifPresent(existingSession -> {
				log.warn("Active session already exists for recipient={}, document={}", request.getRecipientId(),
						request.getDocumentId());
				throw new ModuleException(EidMessageConstant.EID_ERROR_SESSION_ALREADY_ACTIVE);
			});

		// Initiate verification with provider
		EidVerificationSession session = provider.initiateVerification(request.getRecipientId(),
				request.getDocumentId(), endUserIp, request.getUserVisibleData(), request.getDocumentHash());

		// Map to response DTO
		VerificationInitiationResponseDto response = eidMapper.sessionToVerificationInitiationResponse(session);

		log.info("initiateVerification: session created with uuid={}", session.getSessionUuid());
		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional
	public ResponseEntityDto checkVerificationStatus(String sessionId) {
		log.debug("checkVerificationStatus: checking session={}", sessionId);

		EidVerificationSession session = sessionRepository.findBySessionUuid(sessionId)
			.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_ERROR_SESSION_NOT_FOUND));

		// Validate that the current user has permission to check this session
		boolean isDocAccess = isCurrentUserDocAccessRole();
		documentLinkService.validateTokenFlows(isDocAccess, session.getRecipient(), session.getDocument().getId());

		// Only poll provider if session is still active
		if (isSessionActive(session)) {
			EidProvider provider = providerRegistry.getProvider(session.getProviderType())
				.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_ERROR_PROVIDER_NOT_FOUND));

			session = provider.checkStatus(session);
		}

		VerificationStatusResponseDto response = eidMapper.sessionToVerificationStatusResponse(session);

		log.debug("checkVerificationStatus: session={} status={}", sessionId, response.getStatus());
		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional
	public ResponseEntityDto cancelVerification(String sessionId) {
		log.info("cancelVerification: cancelling session={}", sessionId);

		EidVerificationSession session = sessionRepository.findBySessionUuid(sessionId)
			.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_ERROR_SESSION_NOT_FOUND));

		// Validate that the current user has permission to cancel this session
		boolean isDocAccess = isCurrentUserDocAccessRole();
		documentLinkService.validateTokenFlows(isDocAccess, session.getRecipient(), session.getDocument().getId());

		if (!isSessionActive(session)) {
			throw new ModuleException(EidMessageConstant.EID_ERROR_SESSION_NOT_ACTIVE);
		}

		EidProvider provider = providerRegistry.getProvider(session.getProviderType())
			.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_ERROR_PROVIDER_NOT_FOUND));

		provider.cancelVerification(session);

		log.info("cancelVerification: session={} cancelled", sessionId);
		return new ResponseEntityDto(false, "Verification cancelled successfully");
	}

	private boolean isSessionActive(EidVerificationSession session) {
		EidVerificationStatus status = session.getStatus();
		return status == EidVerificationStatus.PENDING || status == EidVerificationStatus.USER_ACTION_REQUIRED;
	}

	private boolean isCurrentUserDocAccessRole() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null) {
			return false;
		}
		return auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch("ROLE_DOC_ACCESS"::equals);
	}

}
