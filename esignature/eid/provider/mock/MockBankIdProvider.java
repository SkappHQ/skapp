package com.skapp.enterprise.esignature.eid.provider.mock;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.eid.constant.EidMessageConstant;
import com.skapp.enterprise.esignature.eid.model.EidVerificationSession;
import com.skapp.enterprise.esignature.eid.model.VerifiedIdentity;
import com.skapp.enterprise.esignature.eid.payload.response.ProviderFrontendConfigDto;
import com.skapp.enterprise.esignature.eid.provider.EidProvider;
import com.skapp.enterprise.esignature.eid.repository.EidVerificationSessionRepository;
import com.skapp.enterprise.esignature.eid.repository.VerifiedIdentityRepository;
import com.skapp.enterprise.esignature.eid.type.EidProviderType;
import com.skapp.enterprise.esignature.eid.type.EidVerificationStatus;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.repository.DocumentDao;
import com.skapp.enterprise.esignature.repository.RecipientDao;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Mock BankID provider for development and testing.
 *
 * This provider simulates BankID behavior without connecting to the real API. It cycles
 * through status states: PENDING -> USER_ACTION_REQUIRED -> VERIFIED
 *
 * Activated when: skapp.esign.eid.mock-enabled=true
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "skapp.esign.eid.mock-enabled", havingValue = "true")
public class MockBankIdProvider implements EidProvider {

	private static final int POLL_INTERVAL_MS = 2000;

	private static final int SESSION_TIMEOUT_SECONDS = 30;

	private static final int POLLS_BEFORE_USER_ACTION = 2;

	private static final int POLLS_BEFORE_VERIFIED = 4;

	private final EidVerificationSessionRepository sessionRepository;

	private final VerifiedIdentityRepository verifiedIdentityRepository;

	private final RecipientDao recipientDao;

	private final DocumentDao documentDao;

	private final ObjectMapper objectMapper;

	// Track poll counts for status progression
	private final Map<String, Integer> sessionPollCounts = new ConcurrentHashMap<>();

	@PostConstruct
	public void init() {
		log.warn("===========================================");
		log.warn("MockBankIdProvider is ACTIVE - FOR TESTING ONLY!");
		log.warn("Do NOT use in production environments.");
		log.warn("===========================================");
	}

	@Override
	public EidProviderType getProviderType() {
		return EidProviderType.SWEDISH_BANKID;
	}

	@Override
	public String getDisplayName() {
		return "Swedish BankID (Mock)";
	}

	@Override
	public boolean isEnabled() {
		return true;
	}

	@Override
	public EidVerificationSession initiateSigning(Long recipientId, Long documentId, String endUserIp,
			String userVisibleData, String documentHash) {
		log.info("MockBankIdProvider: Initiating signing for recipient={}, document={}", recipientId, documentId);

		Recipient recipient = recipientDao.findById(recipientId)
			.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_VALIDATION_RECIPIENT_NOT_FOUND));

		Document document = documentDao.findById(documentId)
			.orElseThrow(() -> new ModuleException(EidMessageConstant.EID_VALIDATION_DOCUMENT_NOT_FOUND));

		// Generate mock tokens (similar to real BankID response)
		String orderRef = UUID.randomUUID().toString();
		String autoStartToken = UUID.randomUUID().toString().replace("-", "");
		String qrStartToken = UUID.randomUUID().toString().replace("-", "");
		String qrStartSecret = UUID.randomUUID().toString().replace("-", "");

		// Create provider data JSON
		ObjectNode providerData = objectMapper.createObjectNode();
		providerData.put("orderRef", orderRef);
		providerData.put("autoStartToken", autoStartToken);
		providerData.put("qrStartToken", qrStartToken);
		providerData.put("qrStartSecret", qrStartSecret);
		providerData.put("documentHash", documentHash);
		providerData.put("mockMode", true);

		// Create and save session
		EidVerificationSession session = EidVerificationSession.builder()
			.recipient(recipient)
			.document(document)
			.providerType(EidProviderType.SWEDISH_BANKID)
			.status(EidVerificationStatus.PENDING)
			.providerSessionId(orderRef)
			.providerData(providerData)
			.endUserIp(endUserIp)
			.documentHash(documentHash)
			.userVisibleData(userVisibleData)
			.initiatedAt(Instant.now())
			.expiresAt(Instant.now().plusSeconds(SESSION_TIMEOUT_SECONDS))
			.build();

		session = sessionRepository.save(session);

		// Initialize poll count
		sessionPollCounts.put(session.getSessionUuid(), 0);

		log.info("MockBankIdProvider: Created session uuid={}, orderRef={}", session.getSessionUuid(), orderRef);

		return session;
	}

	@Override
	public EidVerificationSession checkStatus(EidVerificationSession session) {
		String sessionUuid = session.getSessionUuid();
		int pollCount = sessionPollCounts.getOrDefault(sessionUuid, 0) + 1;
		sessionPollCounts.put(sessionUuid, pollCount);

		log.debug("MockBankIdProvider: Checking status for session={}, pollCount={}", sessionUuid, pollCount);

		// Check if session has expired
		if (session.getExpiresAt() != null && Instant.now().isAfter(session.getExpiresAt())) {
			session.setStatus(EidVerificationStatus.EXPIRED);
			session.setErrorCode("expiredTransaction");
			session.setErrorMessage("The transaction has expired.");
			return sessionRepository.save(session);
		}

		// Progress through states based on poll count
		if (pollCount < POLLS_BEFORE_USER_ACTION) {
			// Still pending - user hasn't started app yet
			session.setStatus(EidVerificationStatus.PENDING);
			updateHintCode(session, "outstandingTransaction");
		}
		else if (pollCount < POLLS_BEFORE_VERIFIED) {
			// User has opened the app, waiting for them to approve
			session.setStatus(EidVerificationStatus.USER_ACTION_REQUIRED);
			updateHintCode(session, "userSign");
		}
		else {
			// Verification complete
			session.setStatus(EidVerificationStatus.VERIFIED);
			session.setCompletedAt(Instant.now());

			// Create verified identity
			createMockVerifiedIdentity(session);

			// Clean up poll count
			sessionPollCounts.remove(sessionUuid);
		}

		return sessionRepository.save(session);
	}

	@Override
	public void cancelVerification(EidVerificationSession session) {
		log.info("MockBankIdProvider: Cancelling session={}", session.getSessionUuid());

		session.setStatus(EidVerificationStatus.CANCELLED);
		session.setErrorCode("userCancel");
		session.setErrorMessage("User cancelled the verification.");

		sessionRepository.save(session);
		sessionPollCounts.remove(session.getSessionUuid());
	}

	@Override
	public ProviderFrontendConfigDto getFrontendConfig() {
		return ProviderFrontendConfigDto.builder()
			.providerType(EidProviderType.SWEDISH_BANKID)
			.displayName(getDisplayName())
			.pollIntervalMs(POLL_INTERVAL_MS)
			.sessionTimeoutSeconds(SESSION_TIMEOUT_SECONDS)
			.qrCodeEnabled(true)
			.sameDeviceEnabled(true)
			.autoStartScheme("bankid://")
			.mockMode(true)
			.build();
	}

	private void updateHintCode(EidVerificationSession session, String hintCode) {
		JsonNode providerData = session.getProviderData();
		if (providerData instanceof ObjectNode objectNode) {
			objectNode.put("hintCode", hintCode);
		}
	}

	private void createMockVerifiedIdentity(EidVerificationSession session) {
		// Check if already exists
		if (verifiedIdentityRepository.existsByRecipientIdAndDocumentId(session.getRecipient().getId(),
				session.getDocument().getId())) {
			return;
		}

		VerifiedIdentity identity = VerifiedIdentity.builder()
			.session(session)
			.recipient(session.getRecipient())
			.document(session.getDocument())
			.providerType(EidProviderType.SWEDISH_BANKID)
			.fullName("Test Testsson")
			.givenName("Test")
			.surname("Testsson")
			.personalNumberHash("mock-hash-" + UUID.randomUUID())
			.deviceIp(session.getEndUserIp())
			.verifiedAt(Instant.now())
			.signatureData("MOCK_SIGNATURE_DATA_BASE64")
			.ocspResponse("MOCK_OCSP_RESPONSE_BASE64")
			.build();

		verifiedIdentityRepository.save(identity);

		log.info("MockBankIdProvider: Created mock verified identity for session={}", session.getSessionUuid());
	}

}
