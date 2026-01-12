package com.skapp.enterprise.esignature.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.enterprise.common.util.HashUtil;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.AuditTrail;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.AuditTrailDto;
import com.skapp.enterprise.esignature.payload.request.MetadataRequestDto;
import com.skapp.enterprise.esignature.payload.response.AuditTrailResponseDto;
import com.skapp.enterprise.esignature.payload.response.AuditValidationResponseDto;
import com.skapp.enterprise.esignature.payload.response.MetadataResponseDto;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.AuditTrailDao;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.service.AuditTrailService;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.type.AuditAction;
import com.skapp.enterprise.common.config.AuditContext;
import com.skapp.enterprise.esignature.type.UserType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditTrailServiceImpl implements AuditTrailService {

	private final AuditTrailDao auditTrailDao;

	private final EnvelopeDao envelopeDao;

	private final RecipientRepository recipientRepository;

	private final UserService userService;

	private final AddressBookDao addressBookDao;

	private final DocumentLinkService documentLinkService;

	private final ObjectMapper objectMapper;

	@Value("${audit-trail.hash-secret-key}")
	private String hashSecretKey;

	@Override
	public ResponseEntityDto createAuditTrail(AuditTrailDto auditTrailDto, String ipAddress, boolean isDocAccess) {
		log.info("Creating audit trail for envelope: {}", auditTrailDto.getEnvelopeId());

		if (!AuditAction.isWebAllowedAction(auditTrailDto.getAction())) {
			log.error("Unauthorized action attempted: {}", auditTrailDto.getAction());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_UNAUTHORIZED_ACTION);
		}

		Envelope envelope = envelopeDao.findById(auditTrailDto.getEnvelopeId()).orElseThrow(() -> {
			log.error("Envelope not found for ID: {}", auditTrailDto.getEnvelopeId());
			return new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		});

		Recipient recipient = null;
		if (auditTrailDto.getRecipientId() != null) {
			recipient = recipientRepository.findById(auditTrailDto.getRecipientId()).orElseThrow(() -> {
				log.error("Recipient not found for ID: {}", auditTrailDto.getRecipientId());
				return new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND);
			});

			documentLinkService.validateTokenFlows(isDocAccess, recipient, null);
		}

		Instant timestamp = Instant.now().truncatedTo(ChronoUnit.MICROS);
		AuditTrail auditTrail = new AuditTrail();

		boolean isAuthorized = false;

		if (recipient == null) {
			User currentUser = userService.getCurrentUser();

			AddressBook addressBookUser = addressBookDao.findByInternalUser(currentUser)
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND));
			log.debug("AddressBook user found: {}", addressBookUser.getId());

			auditTrail.setAddressBookUser(addressBookUser);

			Role esignRole = currentUser.getEmployee().getEmployeeRole().getEsignRole();
			isAuthorized = esignRole.equals(Role.ESIGN_ADMIN) || esignRole.equals(Role.SUPER_ADMIN);
		}
		else if (recipient.getEnvelope().equals(envelope)) {
			isAuthorized = true;
		}

		auditTrail.setIsAuthorized(isAuthorized);

		auditTrail.setEnvelope(envelope);
		auditTrail.setRecipient(recipient);

		auditTrail.setIpAddress(ipAddress);

		auditTrail.setAction(auditTrailDto.getAction());

		// Build metadata with user_agent included
		ArrayNode metadataArray = objectMapper.createArrayNode();

		// Add user_agent to metadata if available
		ObjectNode userAgentNode = createUserAgentMetadataNode();
		if (userAgentNode != null) {
			metadataArray.add(userAgentNode);
		}

		// Add client-provided metadata
		if (auditTrailDto.getMetadata() != null && !auditTrailDto.getMetadata().isEmpty()) {
			for (MetadataRequestDto meta : auditTrailDto.getMetadata()) {
				ObjectNode node = objectMapper.createObjectNode();
				node.put("name", meta.getName());
				node.put("value", meta.getValue());
				metadataArray.add(node);
			}
		}

		auditTrail.setMetadata(metadataArray);

		auditTrail.setTimestamp(timestamp);

		auditTrail.setHash(generateHashToValidate(auditTrail));

		auditTrailDao.save(auditTrail);
		log.info("Audit trail saved successfully with hash: {}", auditTrail.getHash());

		return new ResponseEntityDto("Audit trail created successfully", false);
	}

	@Override
	public ResponseEntityDto validateAuditTrailHash(Long auditTrailId) {
		log.info("Validating audit trail hash for auditTrailId: {}", auditTrailId);

		AuditTrail auditTrail = auditTrailDao.findById(auditTrailId)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_AUDIT_TRAIL_NOT_FOUND));

		boolean isValid = generateHashToValidate(auditTrail).equals(auditTrail.getHash());

		log.info("Audit trail validation result for auditTrailId {}: {}", auditTrailId, isValid ? "Valid" : "Tampered");

		return new ResponseEntityDto(false, new AuditValidationResponseDto(auditTrailId, isValid));
	}

	@Override
	public ResponseEntityDto validateEnvelopeAuditTrails(Long envelopeId) {
		log.info("Validating all audit trails for envelopeId: {}", envelopeId);

		Optional<Envelope> envelopeOptional = envelopeDao.findById(envelopeId);
		if (envelopeOptional.isEmpty()) {
			log.error("envelope with ID {} not found", envelopeId);
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		}

		List<AuditTrail> auditTrails = auditTrailDao.findByEnvelopeId(envelopeId);

		if (auditTrails.isEmpty()) {
			log.error("No audit trails found for envelopeId: {}", envelopeId);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_AUDIT_TRAIL_NOT_FOUND);
		}

		boolean allValid = auditTrails.stream()
			.allMatch(auditTrail -> generateHashToValidate(auditTrail).equals(auditTrail.getHash()));

		log.info("Envelope audit trail validation result for envelopeId {}: {}", envelopeId,
				allValid ? "All Valid" : "Some Tampered");

		return new ResponseEntityDto(false, new AuditValidationResponseDto(envelopeId, allValid));
	}

	@Override
	public ResponseEntityDto getAuditTrailsBySentEnvelope(Long envelopeId) {
		return getAuditTrailsByEnvelopeId(envelopeId, false);
	}

	@Override
	public ResponseEntityDto getAuditTrailsByInboxEnvelope(Long envelopeId) {
		return getAuditTrailsByEnvelopeId(envelopeId, true);
	}

	public ResponseEntityDto getAuditTrailsByEnvelopeId(Long envelopeId, boolean isInbox) {
		log.info("Fetching audit trails for envelopeId: {}", envelopeId);

		User currentUser = userService.getCurrentUser();

		Optional<Envelope> envelopeOptional = envelopeDao.findById(envelopeId);
		if (envelopeOptional.isEmpty()) {
			log.error("envelope with ID {} not found", envelopeId);
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		}
		Envelope envelope = envelopeOptional.get();
		AddressBook addressBook = envelope.getOwner();
		checkAuthorization(isInbox, currentUser, envelope, addressBook);

		List<AuditTrail> auditTrails = auditTrailDao.findByEnvelopeIdOrderByIdDesc(envelopeId);

		if (auditTrails.isEmpty()) {
			log.error("No audit trails found for envelopeId: {}", envelopeId);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_AUDIT_TRAIL_NOT_FOUND);
		}

		List<AuditTrailResponseDto> responseDtoList = new ArrayList<>();

		for (AuditTrail auditTrail : auditTrails) {
			log.debug("Processing audit trail with ID: {}", auditTrail.getId());

			AuditTrailResponseDto responseDto = new AuditTrailResponseDto();

			responseDto.setAuditId(auditTrail.getId());
			responseDto.setAction(auditTrail.getAction());

			List<MetadataResponseDto> metadataList = objectMapper.convertValue(auditTrail.getMetadata(),
					new TypeReference<List<MetadataResponseDto>>() {
					});

			responseDto.setMetadata(metadataList);
			responseDto.setIsAuthorized(auditTrail.getIsAuthorized());
			responseDto.setHash(auditTrail.getHash());

			if (auditTrail.getRecipient() == null && auditTrail.getAddressBookUser() == null) {
				responseDto.setActionDoneByName("");
				log.debug("Action done by: null (both recipient and address book user are null)");
			}
			else if (auditTrail.getRecipient() == null) {
				responseDto.setActionDoneByName(auditTrail.getAddressBookUser().getName());
				log.debug("Action done by: {}", auditTrail.getAddressBookUser().getName());
			}
			else {
				responseDto.setActionDoneByName(auditTrail.getRecipient().getAddressBook().getName());
				log.debug("Action done by recipient: {}", auditTrail.getRecipient().getAddressBook().getName());
			}

			responseDto.setTimestamp(auditTrail.getTimestamp());

			responseDtoList.add(responseDto);
		}

		log.info("Successfully fetched {} audit trails for envelopeId: {}", responseDtoList.size(), envelopeId);

		return new ResponseEntityDto(false, responseDtoList);
	}

	private static void checkAuthorization(boolean isInbox, User currentUser, Envelope envelope,
			AddressBook ownerAddressBook) {
		Role esignRole = currentUser.getEmployee().getEmployeeRole().getEsignRole();

		boolean isSenderRole = esignRole.equals(Role.ESIGN_SENDER);
		boolean isEmployee = esignRole.equals(Role.ESIGN_EMPLOYEE);

		// Check if user is authorized to access this envelope's audit trail
		boolean needsRecipientCheck = isInbox || isEmployee;
		boolean needsOwnerCheck = !isInbox && isSenderRole;

		// If user needs to be a recipient, verify
		if (needsRecipientCheck) {
			Optional<Recipient> recipientOptional = envelope.getRecipients()
				.stream()
				.filter(recipient -> recipient.getAddressBook().getType().equals(UserType.INTERNAL)
						&& recipient.getAddressBook().getUserId().equals(currentUser.getUserId()))
				.findFirst();

			if (recipientOptional.isEmpty()) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}
		}

		// If user needs to be the envelope owner, verify
		if (needsOwnerCheck) {
			boolean isEnvelopeOwner = ownerAddressBook != null && ownerAddressBook.getInternalUser() != null
					&& ownerAddressBook.getInternalUser().getUserId().equals(currentUser.getUserId());

			if (!isEnvelopeOwner) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}
		}
	}

	@Override
	public AuditTrail processAuditTrailInfo(Envelope envelope, Recipient recipient, AuditAction action,
			AddressBook addressBook, String ipAddress, JsonNode metadata) {
		AuditTrail auditTrail = new AuditTrail();

		auditTrail.setEnvelope(envelope);
		auditTrail.setRecipient(recipient);
		auditTrail.setAddressBookUser(addressBook);
		auditTrail.setAction(action);
		auditTrail.setIpAddress(ipAddress);

		// Build complete metadata with user_agent
		ArrayNode metadataArray = objectMapper.createArrayNode();

		// Copy existing metadata into a new ArrayNode to avoid mutating the input
		// parameter
		if (metadata instanceof ArrayNode) {
			metadataArray.addAll((ArrayNode) metadata);
		}

		// Add user_agent to metadata if available
		ObjectNode userAgentNode = createUserAgentMetadataNode();
		if (userAgentNode != null) {
			metadataArray.add(userAgentNode);
		}

		// Set complete metadata once
		auditTrail.setMetadata(metadataArray);

		auditTrail.setIsAuthorized(true);

		Instant timestamp = Instant.now().truncatedTo(ChronoUnit.MICROS);
		auditTrail.setTimestamp(timestamp);
		auditTrail.setHash(generateHashToValidate(auditTrail));

		return auditTrail;
	}

	private String generateHashToValidate(AuditTrail auditTrail) {
		String rawData = auditTrail.getEnvelope().getId() + "_"
				+ (auditTrail.getRecipient() != null ? auditTrail.getRecipient().getId().toString() + "_" : "_")
				+ (auditTrail.getAddressBookUser() != null
						? auditTrail.getAddressBookUser().getInternalUser().getUserId().toString() + "_" : "_")
				+ auditTrail.getIpAddress() + "_" + auditTrail.getAction().name() + "_" + auditTrail.getIsAuthorized()
				+ "_" + auditTrail.getTimestamp().truncatedTo(ChronoUnit.MICROS).toString() + "_"
				+ auditTrail.getMetadata() + "_" + hashSecretKey + "_";

		return HashUtil.hash(rawData);
	}

	/**
	 * Creates an ObjectNode containing user_agent metadata from the current request
	 * context.
	 * @return ObjectNode with user_agent metadata, or null if no user_agent is available
	 */
	private ObjectNode createUserAgentMetadataNode() {
		AuditContext.Context context = AuditContext.get();
		String userAgent = context != null ? context.getUserAgent() : null;
		if (userAgent != null) {
			ObjectNode userAgentNode = objectMapper.createObjectNode();
			userAgentNode.put("name", "user_agent");
			userAgentNode.put("value", userAgent);
			return userAgentNode;
		}
		return null;
	}

}
