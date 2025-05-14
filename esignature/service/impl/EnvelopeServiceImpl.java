package com.skapp.enterprise.esignature.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.common.service.ScheduleService;
import com.skapp.enterprise.common.type.QuartzEntityType;
import com.skapp.enterprise.esignature.constant.EsignConstants;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.AuditTrail;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.EnvelopeSetting;
import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.DeclineEnvelopeRequestDto;
import com.skapp.enterprise.esignature.payload.request.DocumentSignDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeDetailDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeInboxFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeSentFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeUpdateDto;
import com.skapp.enterprise.esignature.payload.request.FieldDto;
import com.skapp.enterprise.esignature.payload.request.RecipientDto;
import com.skapp.enterprise.esignature.payload.request.VoidEnvelopeRequestDto;
import com.skapp.enterprise.esignature.payload.response.AddressBookBasicResponseDto;
import com.skapp.enterprise.esignature.payload.response.AuditTrailResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.EmployeeKPIResponseDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeDetailedResponseDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeInboxInfoResponseDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeInfoResponseDto;
import com.skapp.enterprise.esignature.payload.response.MetadataResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientResponseDto;
import com.skapp.enterprise.esignature.payload.response.SignatureCertificateResponseDto;
import com.skapp.enterprise.esignature.payload.response.SignedDocumentResponse;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.AuditTrailDao;
import com.skapp.enterprise.esignature.repository.DocumentDao;
import com.skapp.enterprise.esignature.repository.DocumentLinkRepository;
import com.skapp.enterprise.esignature.repository.DocumentRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionRepository;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.repository.projection.EnvelopeInboxData;
import com.skapp.enterprise.esignature.repository.projection.EnvelopeSentData;
import com.skapp.enterprise.esignature.service.AuditTrailService;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.service.DocumentService;
import com.skapp.enterprise.esignature.service.EnvelopeService;
import com.skapp.enterprise.esignature.service.RecipientService;
import com.skapp.enterprise.esignature.type.AuditAction;
import com.skapp.enterprise.esignature.type.DocumentPermissionType;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.InboxStatus;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import com.skapp.enterprise.esignature.type.SignType;
import com.skapp.enterprise.esignature.type.UserType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.io.ByteArrayInputStream;
import java.security.KeyPair;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.skapp.community.common.util.DateTimeUtils.getCurrentUtcDateTime;
import static com.skapp.enterprise.esignature.utill.EnvelopeUuidGenerator.generateUniqueEnvelopeId;

@Service
@Slf4j
@RequiredArgsConstructor
public class EnvelopeServiceImpl implements EnvelopeService {

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	private final EsignMapper eSignMapper;

	private final EnvelopeDao envelopeDao;

	private final UserService userService;

	private final DocumentDao documentDao;

	private final AddressBookDao addressBookDao;

	private final RecipientService recipientService;

	private final DocumentService documentService;

	private final DocumentLinkService documentLinkService;

	private final DocumentVersionRepository documentVersionRepository;

	private final DocumentLinkRepository documentLinkRepository;

	private final AmazonS3Service amazonS3Service;

	private final AuditTrailService auditTrailService;

	private final DocumentRepository documentRepository;

	private final RecipientRepository recipientRepository;

	private final AuditTrailDao auditTrailDao;

	private final OrganizationDao organizationDao;

	private final ScheduleService scheduleService;

	private final ApplicationEventPublisher applicationEventPublisher;

	@Override
	@Transactional
	public ResponseEntityDto createNewEnvelope(@Valid EnvelopeDetailDto envelopeDetailDto) {
		User currentUser = userService.getCurrentUser();
		log.info("createNewEnvelope: execution started {}", currentUser.getUserId());

		Optional<AddressBook> addressBookOptional = addressBookDao.findByInternalUser(currentUser);

		AddressBook addressBook = addressBookOptional.filter(AddressBook::getIsActive)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND));

		if (envelopeDetailDto.getExpireAt().isBefore(LocalDateTime.now())) {
			throw new ValidationException(EsignMessageConstant.ESIGN_ERROR_VALIDATION_ENTER_ENVELOPE_EXPIRES_AT);
		}

		Envelope envelope = initializeEnvelope(envelopeDetailDto);

		List<Long> ids = envelopeDetailDto.getDocumentIds().stream().filter(Objects::nonNull).distinct().toList();

		if (ids.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_WITH_NO_DOCUMENT);
		}

		List<Document> documents = assignDocumentsToEnvelope(envelopeDetailDto.getDocumentIds(), envelope);

		envelope.setDocuments(documents);

		boolean hasInvalidDocumentId = envelopeDetailDto.getRecipients()
			.stream()
			.flatMap(recipient -> recipient.getFields().stream())
			.anyMatch(field -> !ids.contains(field.getDocumentId()));

		if (hasInvalidDocumentId) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_DOCUMENT_ID);
		}

		List<Recipient> recipients = buildRecipientsForEnvelope(envelopeDetailDto.getRecipients(), envelope);
		envelope.setRecipients(recipients);
		// setup envelop settings
		EnvelopeSetting envelopeSetting = getEnvelopeSetting(envelopeDetailDto);
		envelopeSetting.setEnvelope(envelope);

		envelope.setSetting(envelopeSetting);
		envelope.setOwner(addressBook);

		Envelope savedEnvelope = envelopeDao.save(envelope);

		List<SignedDocumentResponse> signedDocumentResponseList = getDocumentsFirstVersion(envelopeDetailDto, envelope);

		List<DocumentVersion> documentVersionList = signedDocumentResponseList.stream()
			.map(SignedDocumentResponse::getDocumentVersion)
			.toList();

		documentVersionRepository.saveAll(documentVersionList);

		List<Document> updatedDocuments = signedDocumentResponseList.stream().map(signedDocumentResponse -> {
			DocumentVersion documentVersion = signedDocumentResponse.getDocumentVersion();
			Document document = documentVersion.getDocument();
			document.setCurrentVersion(documentVersion.getVersionNumber());
			document.setCurrentSignOderNumber(1);
			document.setNumOfPages(signedDocumentResponse.getNumberOfPages());
			return document;
		}).toList();

		documentDao.saveAll(updatedDocuments);

		// Send Envelopes to recipient - async
		RecipientService.DocumentLinksAndRecipientsData documentLinksAndRecipientsData = recipientService
			.notifyDocumentFirstRecipients(savedEnvelope.getRecipients(), envelopeDetailDto.getSignType());

		List<Recipient> notifyRecipients = documentLinksAndRecipientsData.recipientList();

		List<DocumentLink> documentLinkList = documentLinksAndRecipientsData.documentLinkList();
		documentLinkRepository.saveAll(documentLinkList);

		Map<Long, Recipient> notifyMap = notifyRecipients.stream()
			.collect(Collectors.toMap(Recipient::getId, Function.identity()));

		for (Recipient recipient : notifyRecipients) {
			Recipient updated = notifyMap.get(recipient.getId());
			if (updated != null) {
				recipient.setReminderBatchId(updated.getReminderBatchId());
				recipient.setReminderStatus(updated.getReminderStatus());
				recipient.setEmailStatus(updated.getEmailStatus());
				recipient.setReceivedAt(getCurrentUtcDateTime());

				if (recipient.getMemberRole().equals(MemberRole.SIGNER)) {
					recipient.setStatus(RecipientStatus.NEED_TO_SIGN);
					recipient.setInboxStatus(InboxStatus.NEED_TO_SIGN);
				}
				else {
					// CC-Member role
					recipient.setStatus(RecipientStatus.COMPLETED);
					recipient.setInboxStatus(InboxStatus.WAITING);
				}
			}
		}

		AuditTrail auditTrail = auditTrailService.processAuditTrailInfo(envelope, null, AuditAction.ENVELOPE_SENT,
				envelope.getOwner(), null);
		auditTrailDao.save(auditTrail);

		EnvelopeDetailedResponseDto responseDto = eSignMapper.envelopeToEnvelopeDetailedResponseDto(savedEnvelope);

		// Register a post-commit callback to handle scheduling after transaction commit
		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				String tenantId = TenantContext.getCurrentTenant();
				scheduleService.scheduleExpiration(savedEnvelope.getId(), tenantId, QuartzEntityType.ENVELOPE,
						savedEnvelope.getExpireAt());
			}
		});

		log.info("createNewEnvelope: execution end {}", currentUser.getUserId());
		return new ResponseEntityDto(false, responseDto);
	}

	private EnvelopeSetting getEnvelopeSetting(EnvelopeDetailDto envelopeDetailDto) {
		EnvelopeSetting envelopeSetting = new EnvelopeSetting();
		envelopeSetting.setExpirationDate(envelopeDetailDto.getEnvelopeSettingDto().getExpirationDate());
		envelopeSetting.setReminderDays(envelopeDetailDto.getEnvelopeSettingDto().getReminderDays());
		return envelopeSetting;
	}

	@Deprecated
	@Override
	public ResponseEntityDto updateEnvelope(Long id, EnvelopeUpdateDto envelopeUpdateDto) {
		log.info("updateEnvelope: execution started");

		Optional<Envelope> envelopeOptional = envelopeDao.findById(id);
		if (envelopeOptional.isEmpty()) {
			log.info("updateEmployee: envelope with ID {} not found", id);
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		}
		Envelope envelope = envelopeOptional.get();

		if (envelopeUpdateDto.getName() != null && !envelopeUpdateDto.getName().isBlank()) {
			envelope.setName(envelopeUpdateDto.getName());
		}

		if (envelopeUpdateDto.getMessage() != null && !envelopeUpdateDto.getMessage().isBlank()) {
			envelope.setMessage(envelopeUpdateDto.getMessage());
		}

		if (envelopeUpdateDto.getSubject() != null && !envelopeUpdateDto.getSubject().isBlank()) {
			envelope.setSubject(envelopeUpdateDto.getSubject());
		}

		if (envelopeUpdateDto.getExpireAt() != null) {
			envelope.setExpireAt(envelopeUpdateDto.getExpireAt());
		}

		if (envelopeUpdateDto.getStatus() != null) {
			// CANCELED, CREATED AND VOIDED are the only status that allow manually update
			if (envelopeUpdateDto.getStatus() == EnvelopeStatus.DECLINED) {
				envelope.setStatus(EnvelopeStatus.DECLINED);
			}
			else if (envelopeUpdateDto.getStatus() == EnvelopeStatus.WAITING) {
				validateEnvelopeExpiration(envelope);
				envelope.setStatus(EnvelopeStatus.WAITING);
			}
			else if (envelopeUpdateDto.getStatus() == EnvelopeStatus.VOIDED) {
				processVoidRequest(envelope);
			}
			else {
				throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_INVALID_STATUS_UPDATE);
			}
		}

		envelope = envelopeDao.save(envelope);
		EnvelopeDetailedResponseDto responseDto = eSignMapper.envelopeToEnvelopeDetailedResponseDto(envelope);
		log.info("updateEnvelope: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	private Envelope initializeEnvelope(EnvelopeDetailDto dto) {
		Envelope envelope = new Envelope();
		envelope.setName(dto.getName());
		envelope.setStatus(EnvelopeStatus.WAITING);
		envelope.setMessage(dto.getMessage());
		envelope.setSubject(dto.getSubject());
		envelope.setExpireAt(dto.getExpireAt());
		envelope.setSentAt(LocalDateTime.now());
		envelope.setSignType(dto.getSignType());
		envelope.setUuid(generateAndEnsureUniqueUuidWithRetry());
		return envelope;
	}

	public String generateAndEnsureUniqueUuidWithRetry() {
		int maxRetries = 3;
		int retryCount = 0;

		while (retryCount < maxRetries) {
			String uuid = generateUniqueEnvelopeId();

			if (!isEnvelopeUuidExists(uuid)) {
				return uuid;
			}

			retryCount++;
		}

		throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_UUID_CREATION_FAIL);
	}

	public boolean isEnvelopeUuidExists(String uuid) {
		return envelopeDao.existsByUuid(uuid);
	}

	private List<Document> assignDocumentsToEnvelope(List<Long> documentIds, Envelope envelope) {
		List<Document> documents = documentDao.findAllById(documentIds);
		if (documents.size() != documentIds.size()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ID_NOT_FOUND);
		}

		// Check if any of the documents already have an envelope
		List<Document> alreadyAssignedDocuments = documents.stream().filter(doc -> doc.getEnvelope() != null).toList();

		if (!alreadyAssignedDocuments.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ALREADY_ASSIGNED);
		}
		documents.forEach(doc -> doc.setEnvelope(envelope));
		return documents;
	}

	private List<Recipient> buildRecipientsForEnvelope(List<RecipientDto> recipientDtos, Envelope envelope) {
		return recipientDtos.stream().map(recipientDto -> {
			AddressBook addressBook = addressBookDao.findById(recipientDto.getAddressBookId())
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_ID_NOT_FOUND));

			if (Boolean.FALSE.equals(addressBook.getIsActive())) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND);
			}

			if (recipientDto.getMemberRole() == MemberRole.CC && !recipientDto.getFields().isEmpty()) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_CC_RECIPIENT_CANNOT_HAVE_FIELDS);
			}

			Recipient recipient = new Recipient();
			recipient.setAddressBook(addressBook);
			recipient.setMemberRole(recipientDto.getMemberRole());
			recipient.setStatus(recipientDto.getStatus());
			recipient.setSigningOrder(recipientDto.getSigningOrder());
			recipient.setColor(recipientDto.getColor());
			recipient.setConsent(false);
			recipient.setEnvelope(envelope);

			List<Field> fields = buildFieldsForRecipient(recipientDto.getFields(), recipient);
			recipient.setFields(fields);

			return recipient;
		}).toList();
	}

	private List<Field> buildFieldsForRecipient(List<FieldDto> fieldDtos, Recipient recipient) {
		return fieldDtos.stream().map(fieldDto -> {
			Document fieldDocument = documentDao.findById(fieldDto.getDocumentId())
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_DOCUMENT_ID_NOT_FOUND));

			Field field = new Field();
			field.setType(fieldDto.getType());
			field.setStatus(fieldDto.getStatus());
			field.setPageNumber(fieldDto.getPageNumber());
			field.setXPosition(fieldDto.getXposition());
			field.setYPosition(fieldDto.getYposition());
			field.setFontFamily(fieldDto.getFontFamily());
			field.setFontColor(fieldDto.getFontColor());
			field.setWidth(fieldDto.getWidth());
			field.setHeight(fieldDto.getHeight());
			field.setDocument(fieldDocument);
			field.setRecipient(recipient);

			return field;
		}).toList();
	}

	private void processVoidRequest(Envelope envelope) {

		log.info("processVoidRequest: Checking if void is prohibited for envelope ID {}", envelope.getId());

		if (EnvelopeStatus.isVoidProhibitedFrom(envelope.getStatus())) {
			log.warn("processVoidRequest: Void prohibited for envelope ID {} with status {}", envelope.getId(),
					envelope.getStatus());
			throw new ValidationException(EsignMessageConstant.ESIGN_ERROR_VOID_PROHIBITED_FROM_CURRENT_STATUS);
		}
		recipientService.voidAllRecipientsByEnvelopeId(envelope.getId());
		envelope.setStatus(EnvelopeStatus.VOIDED);
	}

	private void validateEnvelopeExpiration(Envelope envelope) {
		if (envelope.getExpireAt() == null || envelope.getExpireAt().isBefore(LocalDateTime.now())) {
			throw new ValidationException(EsignMessageConstant.ESIGN_ERROR_VALIDATION_ENTER_ENVELOPE_EXPIRES_AT);
		}
	}

	@Override
	public ResponseEntityDto getEmployeeNeedToSignEnvelopeCount(Long id) {
		User currentUser = userService.getCurrentUser();

		if (!Objects.equals(currentUser.getUserId(), id)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		log.info("getEmployeeNeedToSignEnvelopeCount: execution started by user: {}", currentUser.getUserId());

		long countNeedToSignEnvelopes = envelopeDao.countNeedToSignEnvelopes(id);

		EmployeeKPIResponseDto employeeKPIResponseDto = new EmployeeKPIResponseDto();
		employeeKPIResponseDto.setNeedToSignCount(countNeedToSignEnvelopes);

		log.info("getEmployeeNeedToSignEnvelopeCount: execution ended");

		return new ResponseEntityDto(false, employeeKPIResponseDto);
	}

	@Override
	public ResponseEntityDto getAllUserEnvelopes(EnvelopeInboxFilterDto envelopeInboxFilterDto) {
		log.info("getAllUserEnvelopes: execution started");

		User currentUser = userService.getCurrentUser();
		if (currentUser == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		Page<Envelope> envelopePage = envelopeDao.getAllUserEnvelopes(currentUser.getUserId(), envelopeInboxFilterDto);

		List<EnvelopeInboxData> envelopeInboxDataList = new ArrayList<>();
		envelopePage.getContent().forEach(envelope -> {
			EnvelopeInboxData envelopeInboxData = eSignMapper.envelopeToEnvelopeInboxData(envelope);
			Optional<Recipient> optionalRecipient = envelope.getRecipients()
				.stream()
				.filter(env -> env.getAddressBook().getUserId().equals(currentUser.getUserId()))
				.findFirst();
			if (optionalRecipient.isPresent()) {
				envelopeInboxData.setStatus(optionalRecipient.get().getInboxStatus());
				envelopeInboxData.setReceivedDate(optionalRecipient.get().getReceivedAt());
			}

			envelopeInboxDataList.add(envelopeInboxData);
		});

		PageDto pageDto = new PageDto();
		pageDto.setItems(envelopeInboxDataList);
		pageDto.setCurrentPage(envelopePage.getNumber());
		pageDto.setTotalItems(envelopePage.getTotalElements());
		pageDto.setTotalPages(envelopePage.getTotalPages());

		log.info("getAllUserEnvelopes: execution ended");

		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	public ResponseEntityDto getAllSentEnvelopes(EnvelopeSentFilterDto envelopeSentFilterDto) {
		log.info("getAllSentEnvelopes: execution started");

		User currentUser = userService.getCurrentUser();
		if (currentUser == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		Role esignRole = currentUser.getEmployee().getEmployeeRole().getEsignRole();

		boolean isAllSentEnvelopes = esignRole.equals(Role.ESIGN_ADMIN) || esignRole.equals(Role.SUPER_ADMIN);

		Page<Envelope> envelopePage = envelopeDao.getAllSentEnvelopes(currentUser.getUserId(), envelopeSentFilterDto,
				isAllSentEnvelopes);

		List<EnvelopeSentData> mappedItems = envelopePage.getContent()
			.stream()
			.map(eSignMapper::envelopeToEnvelopeSentData)
			.toList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(mappedItems);
		pageDto.setCurrentPage(envelopePage.getNumber());
		pageDto.setTotalItems(envelopePage.getTotalElements());
		pageDto.setTotalPages(envelopePage.getTotalPages());

		log.info("getAllSentEnvelopes: execution ended");

		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	public ResponseEntityDto getSenderKPI() {
		log.info("getSenderKPI: execution started");

		User currentUser = userService.getCurrentUser();
		if (currentUser == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		Map<EnvelopeStatus, Long> envelopeStatusLongMap = envelopeDao.countEnvelopesByStatus(currentUser.getUserId());
		log.info("getSenderKPI: execution ended");

		return new ResponseEntityDto(false, envelopeStatusLongMap);
	}

	@Override
	public ResponseEntityDto getEnvelopeForCurrentUser(@NotNull Long id) {
		User currentUser = userService.getCurrentUser();

		Optional<Envelope> envelopeOptional = envelopeDao.findById(id);
		if (envelopeOptional.isEmpty()) {
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		}
		Envelope envelope = envelopeOptional.get();
		boolean isRecipient = envelope.getRecipients()
			.stream()
			.anyMatch(recipient -> recipient.getAddressBook().getType().equals(UserType.INTERNAL)
					&& recipient.getAddressBook().getUserId().equals(currentUser.getUserId()));

		if (!isRecipient) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		EnvelopeInboxInfoResponseDto envelopeInboxInfoResponseDto = getEnvelopeInboxInfoResponseDto(envelope);
		Optional<Recipient> currentRecippientOptional = envelope.getRecipients()
			.stream()
			.filter(recipient -> recipient.getStatus().equals(RecipientStatus.NEED_TO_SIGN)
					&& recipient.getAddressBook().getUserId().equals(currentUser.getUserId()))
			.findFirst();

		if (currentRecippientOptional.isPresent()) {
			String accessUrl = documentLinkService.getRecipientDocumentAccessUrlByPermissionType(envelope,
					currentRecippientOptional.get(), DocumentPermissionType.WRITE);
			envelopeInboxInfoResponseDto.setEnvelopeAccessLink(accessUrl);
		}

		return new ResponseEntityDto(false, envelopeInboxInfoResponseDto);
	}

	@Override
	public ResponseEntityDto getEnvelopeForSender(@NotNull Long id) {
		User currentUser = userService.getCurrentUser();

		Optional<Envelope> envelopeOptional = envelopeDao.findById(id);
		if (envelopeOptional.isEmpty()) {
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		}

		Envelope envelope = envelopeOptional.get();
		AddressBook addressBook = envelope.getOwner();

		Role esignRole = currentUser.getEmployee().getEmployeeRole().getEsignRole();

		boolean isAllSentEnvelopes = esignRole.equals(Role.ESIGN_ADMIN) || esignRole.equals(Role.SUPER_ADMIN);

		if (!isAllSentEnvelopes && (Optional.ofNullable(addressBook)
			.map(AddressBook::getInternalUser)
			.map(User::getUserId)
			.filter(userId -> userId.equals(currentUser.getUserId()))
			.isEmpty())) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);

		}

		EnvelopeInfoResponseDto envelopeInfoResponseDto = getEnvelopeInfoResponseDto(envelope);

		return new ResponseEntityDto(false, envelopeInfoResponseDto);
	}

	@Override
	public ResponseEntityDto getSignatureCertificate(Long envelopeId) {
		log.info("getSignatureCertificate: execution started for envelopeId {}", envelopeId);

		Envelope envelope = envelopeDao.findById(envelopeId).orElseThrow(() -> {
			log.error("Envelope with ID {} not found", envelopeId);
			return new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		});

		String username = documentService.getCurrentUsername();

		if (username == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		AddressBook currentAddressBookUser = documentService.getCurrentAddressBookUser(username);

		if (currentAddressBookUser == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND);
		}

		if (currentAddressBookUser.getType() == UserType.INTERNAL) {
			if (recipientRepository.findByEnvelopeIdAndAddressBookId(envelopeId,
					currentAddressBookUser.getId()) == null) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}
		}
		else if (currentAddressBookUser.getType() == UserType.EXTERNAL) {
			Recipient envelopRecipient = recipientService.getRecipientFromToken();
			if (!envelopRecipient.getEnvelope().getId().equals(envelopeId)) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}
		}

		List<AuditTrail> auditTrails = auditTrailDao.findByEnvelopeIdOrderByTimestampAsc(envelopeId);

		SignatureCertificateResponseDto responseDto = eSignMapper.envelopeToSignatureCertificateResponseDto(envelope);

		List<AuditTrailResponseDto> responseDtoList = auditTrails.stream().map(auditTrail -> {
			AuditTrailResponseDto auditTrailResponseDto = new AuditTrailResponseDto();
			auditTrailResponseDto.setAuditId(auditTrail.getId());
			auditTrailResponseDto.setAction(auditTrail.getAction());
			auditTrailResponseDto.setMetadata(new ObjectMapper().convertValue(auditTrail.getMetadata(),
					new TypeReference<List<MetadataResponseDto>>() {
					}));
			auditTrailResponseDto.setIsAuthorized(auditTrail.getIsAuthorized());
			auditTrailResponseDto.setHash(auditTrail.getHash());
			auditTrailResponseDto.setActionDoneByName(auditTrail.getRecipient() == null
					? auditTrail.getAddressBookUser().getInternalUser().getEmployee().getFirstName() + " "
							+ auditTrail.getAddressBookUser().getInternalUser().getEmployee().getLastName()
					: auditTrail.getRecipient().getName());
			auditTrailResponseDto.setTimestamp(auditTrail.getTimestamp());
			return auditTrailResponseDto;
		}).toList();

		organizationDao.findTopByOrderByOrganizationIdDesc()
			.ifPresent(org -> responseDto.setOrganizationTimeZone(org.getOrganizationTimeZone()));
		responseDto.setAuditTrails(responseDtoList);

		log.info("getSignatureCertificate: execution ended for envelopeId {}", envelopeId);
		return new ResponseEntityDto(false, responseDto);
	}

	private EnvelopeInfoResponseDto getEnvelopeInfoResponseDto(Envelope envelope) {
		EnvelopeInfoResponseDto envelopeInfoResponseDto = new EnvelopeInfoResponseDto();
		envelopeInfoResponseDto.setId(envelope.getId());
		envelopeInfoResponseDto.setSubject(envelope.getSubject());
		envelopeInfoResponseDto.setStatus(envelope.getStatus());
		envelopeInfoResponseDto.setSignType(envelope.getSignType());

		List<Recipient> recipients = envelope.getRecipients();
		List<RecipientResponseDto> recipientResponseDtos = eSignMapper.recipientToRecipinetResponseDtoList(recipients);
		envelopeInfoResponseDto.setRecipients(recipientResponseDtos);

		List<DocumentDetailResponseDto> documentDetails = getDocumentDetails(envelope);
		AddressBook addressBook = envelope.getOwner();

		AddressBookBasicResponseDto addressBookBasicResponseDto = eSignMapper
			.addressBookToAddressBookBasicResponseDto(addressBook);
		envelopeInfoResponseDto.setAddressBook(addressBookBasicResponseDto);

		envelopeInfoResponseDto.setDocuments(documentDetails);
		return envelopeInfoResponseDto;
	}

	private EnvelopeInboxInfoResponseDto getEnvelopeInboxInfoResponseDto(Envelope envelope) {
		EnvelopeInboxInfoResponseDto envelopeInboxInfoResponseDto = new EnvelopeInboxInfoResponseDto();
		envelopeInboxInfoResponseDto.setId(envelope.getId());
		envelopeInboxInfoResponseDto.setSubject(envelope.getSubject());
		envelopeInboxInfoResponseDto.setStatus(envelope.getStatus());
		envelopeInboxInfoResponseDto.setSignType(envelope.getSignType());

		List<Recipient> recipients = envelope.getRecipients();
		List<RecipientResponseDto> recipientResponseDtos = eSignMapper.recipientToRecipinetResponseDtoList(recipients);
		envelopeInboxInfoResponseDto.setRecipients(recipientResponseDtos);

		List<DocumentDetailResponseDto> documentDetails = getDocumentDetails(envelope);
		AddressBook addressBook = envelope.getOwner();

		AddressBookBasicResponseDto addressBookBasicResponseDto = eSignMapper
			.addressBookToAddressBookBasicResponseDto(addressBook);
		envelopeInboxInfoResponseDto.setAddressBook(addressBookBasicResponseDto);

		envelopeInboxInfoResponseDto.setDocuments(documentDetails);
		return envelopeInboxInfoResponseDto;
	}

	public List<DocumentDetailResponseDto> getDocumentDetails(Envelope envelope) {
		return envelope.getDocuments().stream().map(document -> {
			int currentVersion = document.getCurrentVersion();
			DocumentVersion documentVersion = documentVersionRepository
				.findByVersionNumberAndDocumentId(currentVersion, document.getId())
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));

			DocumentDetailResponseDto dto = new DocumentDetailResponseDto();
			dto.setId(document.getId());
			dto.setName(document.getName());
			dto.setFilePath(documentVersion.getFilePath());

			return dto;
		}).toList();
	}

	@Transactional
	@Override
	public ResponseEntityDto voidEnvelope(Long envelopeId, VoidEnvelopeRequestDto voidEnvelopeRequestDto,
			String ipAddress) {
		log.info("voidEnvelope: execution started for envelope ID: {}", envelopeId);

		Envelope envelope = envelopeDao.findById(envelopeId).orElseThrow(() -> {
			log.error("voidEnvelope: Envelope not found for ID: {}", envelopeId);
			return new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		});

		User currentUser = userService.getCurrentUser();
		Role esignRole = currentUser.getEmployee().getEmployeeRole().getEsignRole();
		log.debug("voidEnvelope: Current user ID: {}, Role: {}", currentUser.getUserId(), esignRole);

		if (esignRole.equals(Role.ESIGN_SENDER)) {
			AddressBook owner = envelope.getOwner();
			if (!owner.getInternalUser().getUserId().equals(currentUser.getUserId())) {
				log.error("voidEnvelope: Unauthorized access by user ID: {}", currentUser.getUserId());
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}
		}

		if (voidEnvelopeRequestDto.getVoidReason().length() > EsignConstants.ALLOWED_MAX_CHARACTER_ENVELOPE_VOID) {
			throw new ValidationException(EsignMessageConstant.ESIGN_VALIDATION_VOID_REASON_TOO_LONG);
		}
		if (!voidEnvelopeRequestDto.getVoidReason()
			.matches(EsignConstants.ALLOWED_CHARACTERS_REGEX_ENVELOPE_DECLINE_AND_VOID)) {
			throw new ValidationException(EsignMessageConstant.ESIGN_VALIDATION_VOID_REASON_INVALID_CHARACTERS);
		}
		envelope.setVoidReason(voidEnvelopeRequestDto.getVoidReason());

		processVoidRequest(envelope);

		envelope = envelopeDao.save(envelope);

		AddressBook addressBook = addressBookDao.findByInternalUser(currentUser)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND));

		AuditTrail auditTrail = auditTrailService.processAuditTrailInfo(envelope, null, AuditAction.ENVELOPE_VOIDED,
				addressBook, ipAddress);
		auditTrailDao.save(auditTrail);

		recipientService.sendEmailWhenDocumentIsVoidedOrDeclined(envelope.getId());

		log.info("voidEnvelope: execution ended for envelope ID: {}", envelopeId);
		return new ResponseEntityDto(false, "Envelope voided successfully");
	}

	private List<SignedDocumentResponse> getDocumentsFirstVersion(EnvelopeDetailDto envelopeDetailDto,
			Envelope envelope) {
		List<SignedDocumentResponse> signedDocumentResponseList = new ArrayList<>();

		envelopeDetailDto.getDocumentIds().forEach(doc -> {
			DocumentSignDto documentSignDto = new DocumentSignDto();
			documentSignDto.setDocumentId(doc);
			documentSignDto.setEnvelopeId(envelope.getId());
			SignedDocumentResponse signedDocumentResponse = documentService.signFirstVersionDocument(envelope,
					documentSignDto, envelope.getUuid());
			signedDocumentResponseList.add(signedDocumentResponse);
		});
		return signedDocumentResponseList;
	}

	@Transactional
	@Override
	public ResponseEntityDto transferEnvelopeCustody(Long envelopeId, Long addressbookId) {
		log.info("transferEnvelopeCustody: execution started");

		User currentUser = userService.getCurrentUser();
		if (currentUser == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		Optional<Envelope> envelopeOptional = envelopeDao.findById(envelopeId);
		if (envelopeOptional.isEmpty()) {
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		}

		Role esignRole = currentUser.getEmployee().getEmployeeRole().getEsignRole();
		Envelope envelope = envelopeOptional.get();

		if (esignRole.equals(Role.ESIGN_SENDER)) {
			AddressBook owner = envelope.getOwner();
			if (!owner.getInternalUser().getUserId().equals(currentUser.getUserId())) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}
		}

		Optional<AddressBook> addressBookOptional = addressBookDao.findById(addressbookId);
		if (addressBookOptional.isEmpty()) {
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_ID_NOT_FOUND);
		}

		if (envelope.getOwner().getId().equals(addressbookId)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_USER_ALREADY_OWNER_OF_ENVELOPE);
		}

		Document document = documentDao.findByEnvelopeId(envelope.getId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		DocumentVersion currentVersion = documentVersionRepository
			.findByVersionNumberAndDocumentId(document.getCurrentVersion(), document.getId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));

		// Load and validate keys-load previous user keys
		KeyPair keyPairVerify = documentService.loadKeyPair(currentVersion.getAddressBook().getId());

		byte[] documentBytes = amazonS3Service.downloadFileAsBytes(bucketName, currentVersion.getFilePath());

		// Process document version and verify existing signature
		documentService.verifyDocumentSignature(documentBytes, currentVersion, keyPairVerify.getPublic());

		// custody transfer Hash the document
		String newHash = documentService.hashDocument(new ByteArrayInputStream(documentBytes));

		// custody transfer user key pair for sign document
		KeyPair keyPairSign = documentService.loadKeyPair(addressBookOptional.get().getId());

		String signature = documentService.signDocument(Base64.getDecoder().decode(newHash), keyPairSign.getPrivate());

		String fileUrl = currentVersion.getFilePath();

		DocumentVersion newVersion = documentService.buildNewDocumentVersion(currentVersion, fileUrl, newHash,
				signature, addressBookOptional.get());

		documentVersionRepository.save(newVersion);

		// save document on current version
		document.setCurrentVersion(newVersion.getVersionNumber());
		documentRepository.save(document);

		AddressBook newOwner = addressBookOptional.get();
		envelope.setOwner(newOwner);
		envelopeDao.save(envelope);

		log.info("transferEnvelopeCustody: execution ended");
		return new ResponseEntityDto(false, "Envelope custody transferred successfully.");
	}

	@Transactional
	@Override
	public ResponseEntityDto declineEnvelope(Long recipientId, DeclineEnvelopeRequestDto declineEnvelopeRequestDto,
			String ipAddress) {

		log.info("declineEnvelope: execution started for recipient ID: {}", recipientId);

		Recipient recipient = recipientRepository.findById(recipientId).orElseThrow(() -> {
			log.error("Recipient with ID {} not found", recipientId);
			return new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND);
		});

		// Validate the recipient
		if (!recipient.getId().equals(recipientService.getRecipientFromToken().getId())) {
			log.error("Recipient with ID {} is not authorized to decline the envelope", recipientId);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		Envelope envelope = envelopeDao.findById(recipient.getEnvelope().getId()).orElseThrow(() -> {
			log.error("Envelope with ID {} not found for recipient ID {}", recipient.getEnvelope().getId(),
					recipientId);
			return new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		});
		if (EnvelopeStatus.isDeclineProhibitedFrom(envelope.getStatus())) {
			log.warn("processVoidRequest: Void prohibited for envelope ID {} with status {}", envelope.getId(),
					envelope.getStatus());
			throw new ValidationException(EsignMessageConstant.ESIGN_ERROR_DECLINE_PROHIBITED_FROM_CURRENT_STATUS);
		}

		if (recipient.getStatus() != RecipientStatus.NEED_TO_SIGN) {
			log.info("Recipient with ID {} cannot decline the envelope. Current status: {}", recipient.getId(),
					recipient.getStatus());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DECLINE_PROHIBITED_FROM_CURRENT_STATUS);
		}

		if (declineEnvelopeRequestDto.getDeclineReason()
			.length() > EsignConstants.ALLOWED_MAX_CHARACTER_ENVELOPE_DECLINE) {
			throw new ValidationException(EsignMessageConstant.ESIGN_VALIDATION_DECLINE_REASON_TOO_LONG);
		}
		else if (!declineEnvelopeRequestDto.getDeclineReason()
			.matches(EsignConstants.ALLOWED_CHARACTERS_REGEX_ENVELOPE_DECLINE_AND_VOID)) {
			throw new ValidationException(EsignMessageConstant.ESIGN_VALIDATION_DECLINE_REASON_INVALID_CHARACTERS);
		}
		recipient.setDeclineReason(declineEnvelopeRequestDto.getDeclineReason());

		envelope.getRecipients().forEach(recipientData -> {
			if (recipientData.getId().equals(recipient.getId())) {
				recipientData.setStatus(RecipientStatus.DECLINED);
			}

			if (envelope.getSignType().equals(SignType.PARALLEL)
					&& recipientData.getStatus().equals(RecipientStatus.NEED_TO_SIGN)) {
				recipientData.setStatus(RecipientStatus.EMPTY);
			}

			recipientData.setInboxStatus(InboxStatus.DECLINED);
		});

		envelope.setStatus(EnvelopeStatus.DECLINED);
		envelopeDao.save(envelope);
		recipientService.sendEmailWhenDocumentIsVoidedOrDeclined(envelope.getId());

		AuditTrail auditTrail = auditTrailService.processAuditTrailInfo(envelope, recipient,
				AuditAction.ENVELOPE_DECLINED, null, ipAddress);
		auditTrailDao.save(auditTrail);

		log.info("declineEnvelope: execution ended for recipient ID: {}", recipientId);
		return new ResponseEntityDto(false, "Envelope declined successfully");
	}

	@Override
	public void expireEnvelope(Long envelopeId) {
		Optional<Envelope> envelopeOptional = envelopeDao.findById(envelopeId);
		if (envelopeOptional.isEmpty()) {
			log.info("expireEnvelope: envelope with ID {} not found", envelopeId);
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		}

		Envelope envelope = envelopeOptional.get();
		if (!EnvelopeStatus.EXPIRED.equals(envelope.getStatus())) {
			envelope.setStatus(EnvelopeStatus.EXPIRED);

			envelope.getRecipients().forEach(recipient -> {
				recipient.setStatus(RecipientStatus.EXPIRED);
				recipient.setInboxStatus(InboxStatus.EXPIRED);
			});

			envelopeDao.save(envelope);

			AuditTrail auditTrail = auditTrailService.processAuditTrailInfo(envelope, null,
					AuditAction.ENVELOPE_EXPIRED, null, null);
			auditTrailDao.save(auditTrail);

			log.info("Envelope ID: {} marked as EXPIRED in tenant: {}", envelopeId, TenantContext.getCurrentTenant());
		}

	}

}
