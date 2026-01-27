package com.skapp.enterprise.esignature.eid.bankid;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EidMessageConstant;
import com.skapp.enterprise.esignature.eid.EidProvider;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCancelRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCollectRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCollectResponse;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCompletionData;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdSignRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdSignResponse;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdUser;
import com.skapp.enterprise.esignature.eid.config.BankIdProperties;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.EidVerificationSession;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.model.VerifiedIdentity;
import com.skapp.enterprise.esignature.payload.response.eid.ProviderFrontendConfigDto;
import com.skapp.enterprise.esignature.repository.DocumentDao;
import com.skapp.enterprise.esignature.repository.EidVerificationSessionRepository;
import com.skapp.enterprise.esignature.repository.RecipientDao;
import com.skapp.enterprise.esignature.repository.VerifiedIdentityRepository;
import com.skapp.enterprise.esignature.type.EidProviderType;
import com.skapp.enterprise.esignature.type.EidVerificationStatus;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

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

	private static final int POLL_INTERVAL_MS = 2000;

	private static final int SESSION_TIMEOUT_SECONDS = 30;

	private final BankIdClient bankIdClient;

	private final BankIdProperties bankIdProperties;

	private final EidVerificationSessionRepository sessionRepository;

	private final VerifiedIdentityRepository verifiedIdentityRepository;

	private final RecipientDao recipientDao;

	private final DocumentDao documentDao;

	private final ObjectMapper objectMapper;

	@PostConstruct
	public void init() {
		log.info("=".repeat(60));
		log.info("BankIdProvider initialized");
		log.info("  API Base URL: {}", bankIdProperties.getApiBaseUrl());
		log.info("=".repeat(60));
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
			.userNonVisibleData(Base64.getEncoder().encodeToString(documentHash.getBytes(StandardCharsets.UTF_8)))
			.build();

		try {
			// Call BankID /sign endpoint
			BankIdSignResponse signResponse = bankIdClient.sign(signRequest);

			// Create provider data JSON
			ObjectNode providerData = objectMapper.createObjectNode();
			providerData.put("orderRef", signResponse.getOrderRef());
			providerData.put("autoStartToken", signResponse.getAutoStartToken());
			providerData.put("qrStartToken", signResponse.getQrStartToken());
			providerData.put("qrStartSecret", signResponse.getQrStartSecret());
			providerData.put("documentHash", documentHash);

			// Create and save session
			EidVerificationSession session = EidVerificationSession.builder()
				.recipient(recipient)
				.document(document)
				.providerType(EidProviderType.SWEDISH_BANKID)
				.status(EidVerificationStatus.PENDING)
				.providerSessionId(signResponse.getOrderRef())
				.providerData(providerData)
				.endUserIp(endUserIp)
				.documentHash(documentHash)
				.userVisibleData(userVisibleData)
				.initiatedAt(Instant.now())
				.expiresAt(Instant.now().plusSeconds(SESSION_TIMEOUT_SECONDS))
				.build();

			session = sessionRepository.save(session);

			log.info("BankIdProvider: Created session uuid={}, orderRef={}", session.getSessionUuid(),
					signResponse.getOrderRef());

			return session;

		}
		catch (BankIdClient.BankIdApiException e) {
			log.error("BankIdProvider: Failed to initiate signing: {}", e.getMessage());
			throw new ModuleException(EidMessageConstant.EID_ERROR_PROVIDER_INITIATION_FAILED);
		}
	}

	@Override
	public EidVerificationSession checkStatus(EidVerificationSession session) {
		String orderRef = session.getProviderSessionId();
		log.debug("BankIdProvider: Checking status for session={}, orderRef={}", session.getSessionUuid(), orderRef);

		// Check if session has expired locally
		if (session.getExpiresAt() != null && Instant.now().isAfter(session.getExpiresAt())) {
			session.setStatus(EidVerificationStatus.EXPIRED);
			session.setErrorCode("expiredTransaction");
			session.setErrorMessage("The transaction has expired.");
			return sessionRepository.save(session);
		}

		try {
			// Call BankID /collect endpoint
			BankIdCollectRequest collectRequest = BankIdCollectRequest.builder().orderRef(orderRef).build();

			BankIdCollectResponse collectResponse = bankIdClient.collect(collectRequest);

			// Update session based on response
			updateSessionFromCollectResponse(session, collectResponse);

			return sessionRepository.save(session);

		}
		catch (BankIdClient.BankIdApiException e) {
			log.error("BankIdProvider: Failed to collect status: {}", e.getMessage());

			// If the error indicates order not found, mark as expired
			if ("notFound".equals(e.getErrorCode())) {
				session.setStatus(EidVerificationStatus.EXPIRED);
				session.setErrorCode("notFound");
				session.setErrorMessage("Order not found or expired.");
				return sessionRepository.save(session);
			}

			throw new ModuleException(EidMessageConstant.EID_ERROR_PROVIDER_STATUS_CHECK_FAILED);
		}
	}

	@Override
	public void cancelVerification(EidVerificationSession session) {
		String orderRef = session.getProviderSessionId();
		log.info("BankIdProvider: Cancelling session={}, orderRef={}", session.getSessionUuid(), orderRef);

		try {
			// Call BankID /cancel endpoint
			BankIdCancelRequest cancelRequest = BankIdCancelRequest.builder().orderRef(orderRef).build();

			bankIdClient.cancel(cancelRequest);

		}
		catch (BankIdClient.BankIdApiException e) {
			// Log but don't throw - cancel may fail if order already expired
			log.warn("BankIdProvider: Cancel request failed (may already be expired): {}", e.getMessage());
		}

		// Update session status regardless of API result
		session.setStatus(EidVerificationStatus.CANCELLED);
		session.setErrorCode("userCancel");
		session.setErrorMessage("User cancelled the verification.");

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

	private void updateSessionFromCollectResponse(EidVerificationSession session,
			BankIdCollectResponse collectResponse) {
		String status = collectResponse.getStatus();
		String hintCode = collectResponse.getHintCode();

		// Update hint code in provider data
		updateHintCode(session, hintCode);

		switch (status) {
			case "pending" -> handlePendingStatus(session, hintCode);
			case "failed" -> handleFailedStatus(session, hintCode);
			case "complete" -> handleCompleteStatus(session, collectResponse.getCompletionData());
			default -> log.warn("BankIdProvider: Unknown status from BankID: {}", status);
		}
	}

	private void handlePendingStatus(EidVerificationSession session, String hintCode) {
		// Map BankID hint codes to our status
		if ("userSign".equals(hintCode)) {
			session.setStatus(EidVerificationStatus.USER_ACTION_REQUIRED);
		}
		else {
			// outstandingTransaction, noClient, started
			session.setStatus(EidVerificationStatus.PENDING);
		}
	}

	private void handleFailedStatus(EidVerificationSession session, String hintCode) {
		session.setErrorCode(hintCode);

		switch (hintCode) {
			case "expiredTransaction" -> {
				session.setStatus(EidVerificationStatus.EXPIRED);
				session.setErrorMessage("The transaction has expired.");
			}
			case "userCancel" -> {
				session.setStatus(EidVerificationStatus.CANCELLED);
				session.setErrorMessage("User cancelled the signing.");
			}
			case "cancelled" -> {
				session.setStatus(EidVerificationStatus.CANCELLED);
				session.setErrorMessage("The order was cancelled.");
			}
			default -> {
				// certificateErr, startFailed, etc.
				session.setStatus(EidVerificationStatus.FAILED);
				session.setErrorMessage("Signing failed: " + hintCode);
			}
		}
	}

	private void handleCompleteStatus(EidVerificationSession session, BankIdCompletionData completionData) {
		session.setStatus(EidVerificationStatus.VERIFIED);
		session.setCompletedAt(Instant.now());

		// Create verified identity
		if (completionData != null) {
			createVerifiedIdentity(session, completionData);
		}
	}

	private void createVerifiedIdentity(EidVerificationSession session, BankIdCompletionData completionData) {
		// Check if already exists
		if (verifiedIdentityRepository.existsByRecipientIdAndDocumentId(session.getRecipient().getId(),
				session.getDocument().getId())) {
			log.debug("BankIdProvider: VerifiedIdentity already exists for recipient={}, document={}",
					session.getRecipient().getId(), session.getDocument().getId());
			return;
		}

		BankIdUser user = completionData.getUser();
		if (user == null) {
			log.warn("BankIdProvider: No user data in completion data");
			return;
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

		verifiedIdentityRepository.save(identity);

		log.info("BankIdProvider: Created verified identity for session={}, name={}", session.getSessionUuid(),
				user.getName());
	}

	private void updateHintCode(EidVerificationSession session, String hintCode) {
		JsonNode providerData = session.getProviderData();
		if (providerData instanceof ObjectNode objectNode) {
			objectNode.put("hintCode", hintCode);
		}
	}

	private String hashPersonalNumber(String personalNumber) {
		if (personalNumber == null || personalNumber.isEmpty()) {
			return null;
		}
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hash = digest.digest(personalNumber.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(hash);
		}
		catch (NoSuchAlgorithmException e) {
			log.error("SHA-256 algorithm not available", e);
			throw new IllegalStateException("SHA-256 algorithm not available", e);
		}
	}

}
