package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.util.Validation;
import com.skapp.enterprise.esignature.constant.EidMessageConstant;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.eid.EidProvider;
import com.skapp.enterprise.esignature.eid.EidProviderRegistry;
import com.skapp.enterprise.esignature.mapper.EidMapper;
import com.skapp.enterprise.esignature.model.AuditTrail;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.model.EidVerificationSession;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.model.RecipientEidConfig;
import com.skapp.enterprise.esignature.payload.request.eid.InitiateIdentificationRequestDto;
import com.skapp.enterprise.esignature.payload.request.eid.InitiateVerificationRequestDto;
import com.skapp.enterprise.esignature.payload.response.eid.AvailableProviderResponseDto;
import com.skapp.enterprise.esignature.payload.response.eid.VerificationInitiationResponseDto;
import com.skapp.enterprise.esignature.payload.response.eid.VerificationStatusResponseDto;
import com.skapp.enterprise.esignature.repository.DocumentRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionDao;
import com.skapp.enterprise.esignature.repository.EidVerificationSessionRepository;
import com.skapp.enterprise.esignature.repository.AuditTrailDao;
import com.skapp.enterprise.esignature.repository.RecipientDao;
import com.skapp.enterprise.esignature.service.AuditTrailService;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.service.EidVerificationService;
import com.skapp.enterprise.esignature.type.AuditAction;
import com.skapp.enterprise.esignature.type.EidFlowType;
import com.skapp.enterprise.esignature.type.EidVerificationStatus;
import com.skapp.enterprise.esignature.util.BankIdQrCodeUtil;
import com.skapp.enterprise.esignature.util.EsignUtil;
import jakarta.servlet.http.HttpServletRequest;
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

	private final AuditTrailService auditTrailService;

	private final AuditTrailDao auditTrailDao;

	private final DocumentLinkService documentLinkService;

	private final DocumentRepository documentRepository;

	private final DocumentVersionDao documentVersionDao;

	@Override
	public ResponseEntityDto getAvailableProviders() {
		log.info("getAvailableProviders: execution started");

		List<AvailableProviderResponseDto> providers = providerRegistry.getEnabledProviders()
			.stream()
			.map(provider -> AvailableProviderResponseDto.builder()
				.providerType(provider.getProviderType())
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
	public ResponseEntityDto initiateVerification(InitiateVerificationRequestDto request,
			HttpServletRequest httpRequest) {
		log.info("initiateVerification: starting for recipient={}, document={}, provider={}", request.getRecipientId(),
				request.getDocumentId(), request.getProviderType());

		// Extract and validate the client IP address
		String endUserIp = extractClientIp(httpRequest);

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

		// Retrieve document and its latest version to get the hash
		Document document = documentRepository.findById(request.getDocumentId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		DocumentVersion latestVersion = documentVersionDao
			.findByVersionNumberAndDocumentId(document.getCurrentVersion(), document.getId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));

		// Get document hash from the latest version (computed and stored when document
		// was uploaded/signed)
		String documentHash = latestVersion.getDocumentHash();
		if (documentHash == null || documentHash.isBlank()) {
			log.error("Document hash is missing for document={}, version={}", document.getId(),
					latestVersion.getVersionNumber());
			throw new ModuleException(EidMessageConstant.EID_ERROR_DOCUMENT_HASH_MISSING);
		}

		// Generate user-visible data from document metadata
		String userVisibleData = generateUserVisibleData(document);

		// Initiate verification with provider
		EidVerificationSession session = provider.initiateVerification(request.getRecipientId(),
				request.getDocumentId(), endUserIp, userVisibleData, documentHash);

		// Map to response DTO and set computed fields from session entity
		VerificationInitiationResponseDto response = eidMapper.sessionToVerificationInitiationResponse(session);
		response.setAutoStartToken(session.getAutoStartToken());
		if (session.getQrStartToken() != null && session.getQrStartSecret() != null) {
			response.setQrCode(BankIdQrCodeUtil.computeQrCode(session.getQrStartToken(), session.getQrStartSecret(),
					session.getInitiatedAt()));
		}

		log.info("initiateVerification: session created with uuid={}", session.getSessionUuid());
		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional
	public ResponseEntityDto initiateIdentification(InitiateIdentificationRequestDto request,
			HttpServletRequest httpRequest) {
		log.info("initiateIdentification: starting for recipient={}, provider={}", request.getRecipientId(),
				request.getProviderType());

		String endUserIp = extractClientIp(httpRequest);

		Recipient recipient = recipientDao.findById(request.getRecipientId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));
		boolean isDocAccess = isCurrentUserDocAccessRole();
		documentLinkService.validateTokenFlows(isDocAccess, recipient, request.getDocumentId());

		EidProvider provider = providerRegistry.getProvider(request.getProviderType())
			.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_ERROR_PROVIDER_NOT_FOUND));

		if (!provider.isEnabled()) {
			throw new ModuleException(EidMessageConstant.EID_ERROR_PROVIDER_NOT_ENABLED);
		}

		// Check for existing active session for this recipient + document combination
		sessionRepository
			.findFirstByRecipientIdAndDocumentIdOrderByInitiatedAtDesc(request.getRecipientId(),
					request.getDocumentId())
			.filter(this::isSessionActive)
			.ifPresent(existingSession -> {
				log.warn("Active identification session already exists for recipient={}, document={}",
						request.getRecipientId(), request.getDocumentId());
				throw new ModuleException(EidMessageConstant.EID_ERROR_SESSION_ALREADY_ACTIVE);
			});

		EidVerificationSession session = provider.initiateIdentification(request.getRecipientId(),
				request.getDocumentId(), endUserIp, request.getUserVisibleData());

		VerificationInitiationResponseDto response = eidMapper.sessionToVerificationInitiationResponse(session);
		response.setAutoStartToken(session.getAutoStartToken());
		if (session.getQrStartToken() != null && session.getQrStartSecret() != null) {
			response.setQrCode(BankIdQrCodeUtil.computeQrCode(session.getQrStartToken(), session.getQrStartSecret(),
					session.getInitiatedAt()));
		}

		log.info("initiateIdentification: session created with uuid={}", session.getSessionUuid());
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
		Long documentId = session.getDocument() != null ? session.getDocument().getId() : null;
		documentLinkService.validateTokenFlows(isDocAccess, session.getRecipient(), documentId);

		// Only poll provider if session is still active
		if (isSessionActive(session)) {
			EidProvider provider = providerRegistry.getProvider(session.getProviderType())
				.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_ERROR_PROVIDER_NOT_FOUND));

			session = provider.checkStatus(session);

			// Handle verification completion at the service layer
			if (session.getStatus() == EidVerificationStatus.VERIFIED) {
				updateRecipientVerificationStatus(session);
			}
		}

		VerificationStatusResponseDto response = eidMapper.sessionToVerificationStatusResponse(session);

		// Set transient data (hintCode, QR code) from session entity
		if (isSessionActive(session)) {
			response.setHintCode(session.getHintCode());
			if (session.getQrStartToken() != null && session.getQrStartSecret() != null) {
				response.setQrCode(BankIdQrCodeUtil.computeQrCode(session.getQrStartToken(), session.getQrStartSecret(),
						session.getInitiatedAt()));
			}
		}

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
		Long documentId = session.getDocument() != null ? session.getDocument().getId() : null;
		documentLinkService.validateTokenFlows(isDocAccess, session.getRecipient(), documentId);

		if (!isSessionActive(session)) {
			throw new ModuleException(EidMessageConstant.EID_ERROR_SESSION_NOT_ACTIVE);
		}

		EidProvider provider = providerRegistry.getProvider(session.getProviderType())
			.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_ERROR_PROVIDER_NOT_FOUND));

		provider.cancelVerification(session);

		log.info("cancelVerification: session={} cancelled", sessionId);
		return new ResponseEntityDto(false, EidMessageConstant.EID_SUCCESS_VERIFICATION_CANCELLED);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getActiveSession(Long recipientId, Long documentId) {
		log.info("getActiveSession: checking for active session for recipient={}, document={}", recipientId,
				documentId);

		// Validate that the current user has permission to access this recipient/document
		Recipient recipient = recipientDao.findById(recipientId)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));

		boolean isDocAccess = isCurrentUserDocAccessRole();
		documentLinkService.validateTokenFlows(isDocAccess, recipient, documentId);

		// Find the most recent session for this recipient/document
		// Note: We only return sessionId and status here. Frontend should call
		// /status/{sessionId} to get fresh qrCode and other dynamic data.
		return sessionRepository.findFirstByRecipientIdAndDocumentIdOrderByInitiatedAtDesc(recipientId, documentId)
			.filter(this::isSessionActive)
			.map(session -> {
				log.info("getActiveSession: found active session={} with status={}", session.getSessionUuid(),
						session.getStatus());

				VerificationStatusResponseDto response = eidMapper.sessionToVerificationStatusResponse(session);

				return new ResponseEntityDto(false, response);
			})
			.orElseGet(() -> {
				log.info("getActiveSession: no active session found for recipient={}, document={}", recipientId,
						documentId);
				return new ResponseEntityDto(false, null);
			});
	}

	private boolean isSessionActive(EidVerificationSession session) {
		EidVerificationStatus status = session.getStatus();
		return status == EidVerificationStatus.PENDING || status == EidVerificationStatus.USER_ACTION_REQUIRED;
	}

	private void updateRecipientVerificationStatus(EidVerificationSession session) {
		Recipient recipient = session.getRecipient();
		RecipientEidConfig eidConfig = recipient.getEidConfig();

		if (eidConfig == null) {
			eidConfig = RecipientEidConfig.builder()
				.recipient(recipient)
				.eidVerificationMethod(session.getProviderType())
				.build();
			recipient.setEidConfig(eidConfig);
		}

		if (session.getFlowType() == EidFlowType.AUTH) {
			eidConfig.setEidIdentificationStatus(EidVerificationStatus.VERIFIED);
		}
		else {
			eidConfig.setEidVerificationStatus(EidVerificationStatus.VERIFIED);
		}

		if (session.getVerifiedIdentity() != null) {
			eidConfig.setVerifiedIdentity(session.getVerifiedIdentity());
		}

		recipientDao.save(recipient);

		AuditTrail auditTrail = auditTrailService.processAuditTrailInfo(recipient.getEnvelope(), recipient,
				AuditAction.ENVELOPE_IDENTITY_VERIFIED, null, session.getEndUserIp(), null);
		auditTrailDao.save(auditTrail);

		log.info("updateRecipientVerificationStatus: Recipient eID {} status updated to VERIFIED for recipient={}",
				session.getFlowType(), recipient.getId());
	}

	private boolean isCurrentUserDocAccessRole() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null) {
			return false;
		}
		return auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch("ROLE_DOC_ACCESS"::equals);
	}

	private String extractClientIp(HttpServletRequest httpRequest) {
		String endUserIp = EsignUtil.getClientIp(httpRequest);

		// Validate IP using Java's InetAddress to ensure it's a valid IPv4 or IPv6 format
		// This prevents header injection attacks (e.g., X-Forwarded-For containing
		// scripts/SQL)
		if (!Validation.isValidIpAddress(endUserIp)) {
			endUserIp = httpRequest.getRemoteAddr();
		}

		return endUserIp;
	}

	private String generateUserVisibleData(Document document) {
		String documentName = document.getName();
		if (documentName == null || documentName.isBlank()) {
			documentName = "dokument";
		}
		return String.format("Jag undertecknar härmed dokumentet \"%s\".", documentName);
	}

}
