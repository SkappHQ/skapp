package com.skapp.enterprise.esignature.eid.bankid;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.util.HashUtil;
import com.skapp.enterprise.esignature.constant.EidMessageConstant;
import com.skapp.enterprise.esignature.constant.EsignConstants;
import com.skapp.enterprise.esignature.eid.EidProvider;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdAuthRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCancelRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCollectRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCollectResponse;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCompletionData;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdSignRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdSignResponse;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdUser;
import com.skapp.enterprise.esignature.eid.config.BankIdProperties;
import org.springframework.web.client.HttpStatusCodeException;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.EidVerificationSession;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.model.VerifiedIdentity;
import com.skapp.enterprise.esignature.payload.response.eid.ProviderFrontendConfigDto;
import com.skapp.enterprise.esignature.repository.DocumentDao;
import com.skapp.enterprise.esignature.repository.EidVerificationSessionRepository;
import com.skapp.enterprise.esignature.repository.RecipientDao;
import com.skapp.enterprise.esignature.repository.VerifiedIdentityRepository;
import com.skapp.enterprise.esignature.type.BankIdHintCode;
import com.skapp.enterprise.esignature.type.BankIdStatus;
import com.skapp.enterprise.esignature.type.AuditAction;
import com.skapp.enterprise.esignature.type.EidFlowType;
import com.skapp.enterprise.esignature.type.EidProviderType;
import com.skapp.enterprise.esignature.type.EidVerificationStatus;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

/**
 * Swedish BankID provider implementation.
 *
 * <p>
 * This provider integrates with the BankID API v6.0 to verify user identity through the
 * signing flow. It calls the real BankID API endpoints (/sign, /collect, /cancel).
 * </p>
 *
 * <p>
 * Activated when: skapp.esign.eid.providers.swedish-bankid.enabled=true
 * </p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "skapp.esign.eid.providers.swedish-bankid.enabled", havingValue = "true")
public class BankIdProvider implements EidProvider {

	private static final int POLL_INTERVAL_MS = 1000;

	private static final int SESSION_TIMEOUT_SECONDS = 30;

	private static final int MAX_SESSION_DURATION_SECONDS = EsignConstants.EID_MAX_SESSION_DURATION_SECONDS;

	private final BankIdClient bankIdClient;

	private final BankIdProperties bankIdProperties;

	private final EidVerificationSessionRepository sessionRepository;

	private final VerifiedIdentityRepository verifiedIdentityRepository;

	private final RecipientDao recipientDao;

	private final DocumentDao documentDao;

	@PostConstruct
	public void init() {
		log.info("============================================================");
		log.info("BankIdProvider initialized");
		log.info("  API Base URL: {}", bankIdProperties.getApiBaseUrl());
		log.info("============================================================");
	}

	@Override
	public EidProviderType getProviderType() {
		return EidProviderType.SWEDISH_BANKID;
	}

	@Override
	public boolean isEnabled() {
		return bankIdProperties.isEnabled();
	}

	@Override
	public EidVerificationSession initiateVerification(Long recipientId, Long documentId, String endUserIp,
			String userVisibleData, String documentHash) {
		log.info("BankIdProvider: Initiating signing for recipient={}, document={}", recipientId, documentId);

		Recipient recipient = recipientDao.findById(recipientId)
			.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_VALIDATION_RECIPIENT_NOT_FOUND));

		Document document = documentDao.findById(documentId)
			.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_VALIDATION_DOCUMENT_NOT_FOUND));

		// Prepare BankID sign request
		BankIdSignRequest signRequest = BankIdSignRequest.builder()
			.endUserIp(endUserIp)
			.userVisibleData(Base64.getEncoder().encodeToString(userVisibleData.getBytes(StandardCharsets.UTF_8)))
			.userNonVisibleData(documentHash)
			.build();

		// Call BankID /sign endpoint
		BankIdSignResponse signResponse = bankIdClient.sign(signRequest);

		// Create and save session with BankID transient data
		Instant now = Instant.now();
		EidVerificationSession session = EidVerificationSession.builder()
			.recipient(recipient)
			.document(document)
			.providerType(EidProviderType.SWEDISH_BANKID)
			.flowType(EidFlowType.SIGN)
			.status(EidVerificationStatus.PENDING)
			.providerSessionId(signResponse.getOrderRef())
			.endUserIp(endUserIp)
			.documentHash(documentHash)
			.userVisibleData(userVisibleData)
			.initiatedAt(now)
			.expiresAt(now.plusSeconds(SESSION_TIMEOUT_SECONDS))
			.overallExpiresAt(now.plusSeconds(MAX_SESSION_DURATION_SECONDS))
			.qrStartToken(signResponse.getQrStartToken())
			.qrStartSecret(signResponse.getQrStartSecret())
			.autoStartToken(signResponse.getAutoStartToken())
			.build();

		session = sessionRepository.save(session);

		log.info("BankIdProvider: Created session uuid={}, orderRef={}", session.getSessionUuid(),
				signResponse.getOrderRef());

		return session;
	}

	@Override
	public EidVerificationSession initiateIdentification(Long recipientId, Long documentId, String endUserIp,
			String userVisibleData) {
		log.info("BankIdProvider: Initiating identification for recipient={}, document={}", recipientId, documentId);

		Recipient recipient = recipientDao.findById(recipientId)
			.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_VALIDATION_RECIPIENT_NOT_FOUND));

		Document document = null;
		if (documentId != null) {
			document = documentDao.findById(documentId)
				.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_VALIDATION_DOCUMENT_NOT_FOUND));
		}

		BankIdAuthRequest.BankIdAuthRequestBuilder requestBuilder = BankIdAuthRequest.builder().endUserIp(endUserIp);

		if (userVisibleData != null && !userVisibleData.isBlank()) {
			requestBuilder
				.userVisibleData(Base64.getEncoder().encodeToString(userVisibleData.getBytes(StandardCharsets.UTF_8)));
		}

		BankIdSignResponse authResponse = bankIdClient.auth(requestBuilder.build());

		Instant now = Instant.now();
		EidVerificationSession session = EidVerificationSession.builder()
			.recipient(recipient)
			.document(document)
			.providerType(EidProviderType.SWEDISH_BANKID)
			.flowType(EidFlowType.AUTH)
			.status(EidVerificationStatus.PENDING)
			.providerSessionId(authResponse.getOrderRef())
			.endUserIp(endUserIp)
			.userVisibleData(userVisibleData)
			.initiatedAt(now)
			.expiresAt(now.plusSeconds(SESSION_TIMEOUT_SECONDS))
			.overallExpiresAt(now.plusSeconds(MAX_SESSION_DURATION_SECONDS))
			.qrStartToken(authResponse.getQrStartToken())
			.qrStartSecret(authResponse.getQrStartSecret())
			.autoStartToken(authResponse.getAutoStartToken())
			.build();

		session = sessionRepository.save(session);

		log.info("BankIdProvider: Created identification session uuid={}, orderRef={}", session.getSessionUuid(),
				authResponse.getOrderRef());

		return session;
	}

	@Override
	public EidVerificationSession checkStatus(EidVerificationSession session) {
		String orderRef = session.getProviderSessionId();
		log.debug("BankIdProvider: Checking status for session={}, orderRef={}", session.getSessionUuid(), orderRef);

		// Check if session has expired locally
		if (session.getExpiresAt() != null && Instant.now().isAfter(session.getExpiresAt())) {
			session.setStatus(EidVerificationStatus.EXPIRED);
			session.setHintCode(BankIdHintCode.EXPIRED_TRANSACTION.getValue());
			session.setErrorMessage("The transaction has expired.");
			clearTransientData(session);
			return sessionRepository.save(session);
		}

		BankIdCollectRequest collectRequest = new BankIdCollectRequest(orderRef);
		BankIdCollectResponse collectResponse = bankIdClient.collect(collectRequest);

		updateSessionFromCollectResponse(session, collectResponse);

		return sessionRepository.save(session);
	}

	@Override
	public void cancelVerification(EidVerificationSession session) {
		String orderRef = session.getProviderSessionId();
		log.info("BankIdProvider: Cancelling session={}, orderRef={}", session.getSessionUuid(), orderRef);

		try {
			// Call BankID /cancel endpoint
			BankIdCancelRequest cancelRequest = new BankIdCancelRequest(orderRef);

			bankIdClient.cancel(cancelRequest);

		}
		catch (HttpStatusCodeException e) {
			// Log but don't throw - cancel may fail if order already expired
			log.warn("BankIdProvider: Cancel request failed (may already be expired): {}", e.getMessage());
		}

		// Update session status regardless of API result
		session.setStatus(EidVerificationStatus.CANCELLED);
		session.setHintCode(BankIdHintCode.USER_CANCEL.getValue());
		session.setErrorMessage("User cancelled the verification.");

		clearTransientData(session);
		sessionRepository.save(session);
	}

	@Override
	public ProviderFrontendConfigDto getFrontendConfig() {
		return ProviderFrontendConfigDto.builder()
			.providerType(EidProviderType.SWEDISH_BANKID)
			.pollIntervalMs(POLL_INTERVAL_MS)
			.sessionTimeoutSeconds(SESSION_TIMEOUT_SECONDS)
			.qrCodeEnabled(true)
			.sameDeviceEnabled(true)
			.autoStartScheme("bankid://")
			.mockMode(false)
			.build();
	}

	@Override
	public AuditAction getIdentityVerifiedAuditAction() {
		return AuditAction.ENVELOPE_IDENTITY_VERIFIED_SWEDISH_BANKID;
	}

	private void updateSessionFromCollectResponse(EidVerificationSession session,
			BankIdCollectResponse collectResponse) {
		String status = collectResponse.getStatus();
		String hintCode = collectResponse.getHintCode();

		// Update hint code on the session entity
		session.setHintCode(hintCode);

		BankIdStatus bankIdStatus = BankIdStatus.fromValue(status);
		if (bankIdStatus == null) {
			log.warn("BankIdProvider: Unknown status from BankID: {}", status);
			return;
		}

		switch (bankIdStatus) {
			case PENDING -> handlePendingStatus(session, hintCode);
			case FAILED -> handleFailedStatus(session, hintCode);
			case COMPLETE -> handleCompleteStatus(session, collectResponse.getCompletionData());
		}
	}

	private void handlePendingStatus(EidVerificationSession session, String hintCode) {
		if (BankIdHintCode.USER_SIGN.getValue().equals(hintCode)) {
			session.setStatus(EidVerificationStatus.USER_ACTION_REQUIRED);
		}
		else {
			session.setStatus(EidVerificationStatus.PENDING);
		}
	}

	private void handleFailedStatus(EidVerificationSession session, String hintCode) {
		BankIdHintCode bankIdHintCode = BankIdHintCode.fromValue(hintCode);
		if (bankIdHintCode == null) {
			session.setStatus(EidVerificationStatus.FAILED);
			session.setErrorMessage("Signing failed: " + hintCode);
			clearTransientData(session);
			return;
		}

		switch (bankIdHintCode) {
			case EXPIRED_TRANSACTION -> {
				session.setStatus(EidVerificationStatus.EXPIRED);
				session.setErrorMessage("The transaction has expired.");
			}
			case USER_CANCEL -> {
				session.setStatus(EidVerificationStatus.CANCELLED);
				session.setErrorMessage("User cancelled the signing.");
			}
			case CANCELLED -> {
				session.setStatus(EidVerificationStatus.CANCELLED);
				session.setErrorMessage("The order was cancelled.");
			}
			default -> {
				session.setStatus(EidVerificationStatus.FAILED);
				session.setErrorMessage("Signing failed: " + hintCode);
			}
		}

		clearTransientData(session);
	}

	private void handleCompleteStatus(EidVerificationSession session, BankIdCompletionData completionData) {
		session.setStatus(EidVerificationStatus.VERIFIED);
		session.setCompletedAt(Instant.now());
		session.setHintCode(null);

		// Create verified identity
		if (completionData != null) {
			VerifiedIdentity verifiedIdentity = createVerifiedIdentity(session, completionData);
			if (verifiedIdentity != null) {
				session.setVerifiedIdentity(verifiedIdentity);
			}
		}

		clearTransientData(session);
		log.info("BankIdProvider: Verification completed for session={}", session.getSessionUuid());
	}

	private VerifiedIdentity createVerifiedIdentity(EidVerificationSession session,
			BankIdCompletionData completionData) {
		Long recipientId = session.getRecipient().getId();
		Long documentId = session.getDocument() != null ? session.getDocument().getId() : null;

		// Check if already exists (auth sessions have no document)
		boolean alreadyExists = (documentId == null)
				? verifiedIdentityRepository.existsByRecipientIdAndDocumentIdIsNull(recipientId)
				: verifiedIdentityRepository.existsByRecipientIdAndDocumentId(recipientId, documentId);

		if (alreadyExists) {
			log.debug("BankIdProvider: VerifiedIdentity already exists for recipient={}, document={}", recipientId,
					documentId);
			return (documentId == null)
					? verifiedIdentityRepository.findByRecipientIdAndDocumentIdIsNull(recipientId).orElse(null)
					: verifiedIdentityRepository.findByRecipientIdAndDocumentId(recipientId, documentId).orElse(null);
		}

		BankIdUser user = completionData.getUser();
		if (user == null) {
			log.warn("BankIdProvider: No user data in completion data");
			return null;
		}

		// Hash the personal number for storage (never store plain text)
		String personalNumberHash = hashPersonalNumber(user.getPersonalNumber());

		// Get device IP if available
		String deviceIp = completionData.getDevice() != null ? completionData.getDevice().getIpAddress() : null;

		VerifiedIdentity identity = VerifiedIdentity.builder()
			.session(session)
			.recipient(session.getRecipient())
			.document(session.getDocument())
			.providerType(EidProviderType.SWEDISH_BANKID)
			.fullName(user.getName())
			.givenName(user.getGivenName())
			.surname(user.getSurname())
			.personalNumberHash(personalNumberHash)
			.deviceIp(deviceIp != null ? deviceIp : session.getEndUserIp())
			.verifiedAt(Instant.now())
			.signatureData(completionData.getSignature())
			.ocspResponse(completionData.getOcspResponse())
			.build();

		identity = verifiedIdentityRepository.save(identity);

		log.info("BankIdProvider: Created verified identity for session={}, name={}", session.getSessionUuid(),
				user.getName());

		return identity;
	}

	private String hashPersonalNumber(String personalNumber) {
		if (personalNumber == null || personalNumber.isEmpty()) {
			return null;
		}
		return HashUtil.hashSha256Hex(personalNumber);
	}

	/**
	 * Clears transient BankID data from the session when it reaches a terminal state.
	 * This data is only needed during active verification.
	 */
	private void clearTransientData(EidVerificationSession session) {
		session.setQrStartToken(null);
		session.setQrStartSecret(null);
		session.setAutoStartToken(null);
	}

}
