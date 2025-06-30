package com.skapp.enterprise.esignature.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
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
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.peopleplanner.constant.PeopleConstants;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.common.service.ScheduleService;
import com.skapp.enterprise.common.type.QuartzEntityType;
import com.skapp.enterprise.common.type.Tier;
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
import com.skapp.enterprise.esignature.payload.response.EnvelopeTierLimitationResponseDto;
import com.skapp.enterprise.esignature.payload.response.MetadataResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientResponseDto;
import com.skapp.enterprise.esignature.payload.response.SignatureCertificateResponseDto;
import com.skapp.enterprise.esignature.payload.response.SignedDocumentResponse;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.AuditTrailDao;
import com.skapp.enterprise.esignature.repository.DocumentDao;
import com.skapp.enterprise.esignature.repository.DocumentLinkRepository;
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
import com.skapp.enterprise.esignature.type.EmailReminderStatus;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.InboxStatus;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import com.skapp.enterprise.esignature.type.SignType;
import com.skapp.enterprise.esignature.type.UserType;
import com.skapp.enterprise.people.repository.EpEmployeeRoleDao;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.KeyPair;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Month;
import java.time.Year;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.skapp.community.common.util.DateTimeUtils.getCurrentUtcDateTime;
import static com.skapp.enterprise.esignature.util.EnvelopeUuidGenerator.generateUniqueEnvelopeId;

@Service
@Slf4j
@RequiredArgsConstructor
public class EnvelopeServiceImpl implements EnvelopeService {

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	@Value("${esign.envelope.allocated-free-tier-envelope-count}")
	private long allocatedFreeTierEnvelopeCount;

	@Value("${esign.envelope.allocated-per-user-envelope-count}")
	private long allocatedPerUserEnvelopeCount;

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

	private final RecipientRepository recipientRepository;

	private final AuditTrailDao auditTrailDao;

	private final OrganizationDao organizationDao;

	private final ScheduleService scheduleService;

	private final TenantContext tenantContext;

	private final TenantDao tenantDao;

	private final EmployeeDao employeeDao;

	private final EpEmployeeRoleDao epEmployeeRoleDao;

	private static final int LEAP_DAY = 29;

	private static final Month FEBRUARY = Month.FEBRUARY;

	private static final Month MARCH = Month.MARCH;

	private static final int FIRST_DAY = 1;

	@Override
	@Transactional
	public ResponseEntityDto createNewEnvelope(@Valid EnvelopeDetailDto envelopeDetailDto) {
		User currentUser = userService.getCurrentUser();
		log.info("createNewEnvelope: execution started {}", currentUser.getUserId());

		EnvelopeTierLimitationResponseDto envelopeTierLimitationResponseDto = processEnvelopeTierLimitation();

		if (envelopeTierLimitationResponseDto.isLimitedReached()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_LIMIT_REACHED);
		}

		Optional<AddressBook> addressBookOptional = addressBookDao.findByInternalUser(currentUser);

		AddressBook addressBook = addressBookOptional.filter(AddressBook::getIsActive)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND));

		if (envelopeDetailDto.getEnvelopeSettingDto().getExpirationDate() == null) {
			throw new ValidationException(EsignMessageConstant.ESIGN_ERROR_VALIDATION_ENTER_ENVELOPE_EXPIRES_AT);
		}

		if (envelopeDetailDto.getEnvelopeSettingDto().getExpirationDate().isBefore(LocalDate.now())
				|| envelopeDetailDto.getEnvelopeSettingDto().getExpirationDate().isEqual(LocalDate.now())) {
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

		List<AuditTrail> auditTrails = new ArrayList<>();
		AuditTrail auditTrailCreate = auditTrailService.processAuditTrailInfo(envelope, null,
				AuditAction.ENVELOPE_CREATED, envelope.getOwner(), null, null);

		auditTrails.add(auditTrailCreate);

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
					for (Document doc : updatedDocuments) {
						doc.setCurrentSignOderNumber(recipient.getSigningOrder());
					}
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

		boolean isDocumentComplete = envelope.getRecipients()
			.stream()
			.allMatch(recipient -> recipient.getStatus() == RecipientStatus.COMPLETED);
		if (isDocumentComplete) {
			envelope.getRecipients().forEach(recipient -> recipient.setInboxStatus(InboxStatus.COMPLETED));

			envelope.setStatus(EnvelopeStatus.COMPLETED);
		}

		documentDao.saveAll(updatedDocuments);

		AuditTrail auditTrailSent = auditTrailService.processAuditTrailInfo(envelope, null, AuditAction.ENVELOPE_SENT,
				envelope.getOwner(), null, null);

		auditTrails.add(auditTrailSent);

		auditTrailDao.saveAll(auditTrails);

		EnvelopeDetailedResponseDto responseDto = eSignMapper.envelopeToEnvelopeDetailedResponseDto(savedEnvelope);

		// Register a post-commit callback to handle scheduling after transaction commit
		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				String tenantId = TenantContext.getCurrentTenant();
				scheduleService.scheduleExpiration(savedEnvelope.getId(), tenantId, QuartzEntityType.ENVELOPE,
						LocalDateTime.of(envelopeDetailDto.getEnvelopeSettingDto().getExpirationDate(), LocalTime.MAX));
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
		validateSigningOrder(recipientDtos);

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
			recipient.setStatus(RecipientStatus.EMPTY);
			recipient.setInboxStatus(InboxStatus.NONE);
			recipient.setSigningOrder(recipientDto.getSigningOrder());
			recipient.setColor(recipientDto.getColor());
			recipient.setConsent(recipientDto.getMemberRole().equals(MemberRole.CC));
			recipient.setEnvelope(envelope);

			List<Field> fields = buildFieldsForRecipient(recipientDto.getFields(), recipient);
			recipient.setFields(fields);

			return recipient;
		}).toList();
	}

	private static void validateSigningOrder(List<RecipientDto> recipientDtos) {
		// Validate signing orders are not zero and are unique
		Set<Integer> signingOrders = new HashSet<>();
		for (RecipientDto recipientDto : recipientDtos) {
			if (recipientDto.getSigningOrder() <= 0) {
				throw new ValidationException(EsignMessageConstant.ESIGN_ERROR_SIGNING_ORDER_CANNOT_BE_ZERO);
			}

			if (!signingOrders.add(recipientDto.getSigningOrder())) {
				throw new ValidationException(EsignMessageConstant.ESIGN_ERROR_DUPLICATE_SIGNING_ORDER);
			}
		}
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

			EnvelopeStatus envelopeStatus = envelope.getStatus();

			List<Recipient> orderedRecipients = envelope.getRecipients()
				.stream()
				.filter(recipient -> recipient.getAddressBook() != null
						&& recipient.getAddressBook().getUserId().equals(currentUser.getUserId())
						&& (envelopeStatus == EnvelopeStatus.VOIDED
								|| (SignType.PARALLEL.equals(envelope.getSignType())
										&& envelopeStatus == EnvelopeStatus.DECLINED)
								|| (recipient.getStatus() != null && recipient.getStatus() != RecipientStatus.EMPTY)))
				.sorted(Comparator.comparingInt(Recipient::getSigningOrder).reversed())
				.toList();

			Recipient resultRecipient = orderedRecipients.stream()
				.filter(r -> r.getStatus() == RecipientStatus.NEED_TO_SIGN)
				.findFirst()
				.orElseGet(() -> orderedRecipients.isEmpty() ? null : orderedRecipients.getFirst());

			if (resultRecipient != null) {
				envelopeInboxData.setStatus(resultRecipient.getInboxStatus());
				envelopeInboxData.setReceivedDate(orderedRecipients.getLast().getReceivedAt());
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
		boolean isAllCount = currentUser.getEmployee().getEmployeeRole().getEsignRole().equals(Role.ESIGN_ADMIN)
				|| currentUser.getEmployee().getEmployeeRole().getEsignRole().equals(Role.SUPER_ADMIN);

		Map<EnvelopeStatus, Long> envelopeStatusLongMap = envelopeDao.countEnvelopesByStatus(currentUser.getUserId(),
				isAllCount);
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

		Optional<Recipient> recipientOptional = envelope.getRecipients()
			.stream()
			.filter(recipient -> recipient.getAddressBook().getType().equals(UserType.INTERNAL)
					&& recipient.getAddressBook().getUserId().equals(currentUser.getUserId()))
			.findFirst();

		if (recipientOptional.isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		Recipient recipient = recipientOptional.get();

		if (recipient.getInboxStatus().equals(InboxStatus.NONE)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		EnvelopeInboxInfoResponseDto envelopeInboxInfoResponseDto = getEnvelopeInboxInfoResponseDto(envelope,
				recipient);

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
	public byte[] getSignatureCertificate(Long envelopeId, HttpHeaders headers, boolean isDocAccess) {
		log.info("getSignatureCertificate: execution started for envelopeId {}", envelopeId);

		Envelope envelope = envelopeDao.findById(envelopeId).orElseThrow(() -> {
			log.error("Envelope with ID {} not found", envelopeId);
			return new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		});

		validateUser(envelopeId, isDocAccess);

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
			if (auditTrail.getRecipient() == null && auditTrail.getAddressBookUser() == null) {
				auditTrailResponseDto.setActionDoneByName("");
				log.debug("Action done by: null (both recipient and address book user are null)");
			}
			else if (auditTrail.getRecipient() == null) {
				auditTrailResponseDto.setActionDoneByName(auditTrail.getAddressBookUser().getName());
				log.debug("Action done by: {}", auditTrail.getAddressBookUser().getName());
			}
			else {
				auditTrailResponseDto.setActionDoneByName(auditTrail.getRecipient().getAddressBook().getName());
				log.debug("Action done by recipient: {}", auditTrail.getRecipient().getAddressBook().getName());
			}
			auditTrailResponseDto.setTimestamp(auditTrail.getTimestamp());
			return auditTrailResponseDto;
		}).toList();

		organizationDao.findTopByOrderByOrganizationIdDesc()
			.ifPresent(org -> responseDto.setOrganizationTimeZone(org.getOrganizationTimeZone()));
		responseDto.setAuditTrails(responseDtoList);

		log.info("getSignatureCertificate: execution ended for envelopeId {}", envelopeId);

		try {
			// Generate HTML content for the certificate
			String html = generateSignatureCertificateHtml(responseDto);

			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			PdfRendererBuilder builder = new PdfRendererBuilder();
			builder.withHtmlContent(html, null);
			builder.toStream(baos);
			builder.run();

			byte[] pdfBytes = baos.toByteArray();

			// Set appropriate headers for PDF response
			headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
			headers.setContentLength(pdfBytes.length);
			headers.add("Content-Disposition",
					"inline; filename=\"" + EsignConstants.DOCUMENT_HISTORY_PREFIX + responseDto.getName() + ".pdf\"");

			return pdfBytes;
		}
		catch (IOException e) {
			log.error("Error generating signature certificate PDF", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_GENERATE_SIGNATURE_CERTIFICATE_PDF);
		}
	}

	private void validateUser(Long envelopeId, boolean isDocAccess) {
		if (isDocAccess) {
			// Document access via token validation
			DocumentLink documentLinkFromToken = documentLinkService.getDocumentLinkFromToken();
			Long addressBookId = documentLinkFromToken.getRecipientId().getAddressBook().getId();

			if (recipientRepository.findByEnvelopeIdAndAddressBookId(envelopeId, addressBookId).isEmpty()) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}
		}
		else {
			// Internal user access validation
			User currentUser = userService.getCurrentUser();
			if (currentUser == null) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
			}

			Role esignRole = currentUser.getEmployee().getEmployeeRole().getEsignRole();
			boolean isAdmin = esignRole.equals(Role.ESIGN_ADMIN);

			// Admins have automatic access, other users need validation
			if (!isAdmin) {
				// Check if user is a recipient
				AddressBook currentAddressBookUser = documentService.getCurrentAddressBookUser(currentUser.getEmail());
				if (currentAddressBookUser == null) {
					throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND);
				}

				if (recipientRepository.findByEnvelopeIdAndAddressBookId(envelopeId, currentAddressBookUser.getId())
					.isEmpty()) {
					throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
				}

				// Check if user is the envelope owner
				AddressBook ownerAddressBook = envelopeDao.findById(envelopeId)
					.map(Envelope::getOwner)
					.orElseThrow(
							() -> new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND));

				boolean isEnvelopeOwner = Optional.ofNullable(ownerAddressBook)
					.map(AddressBook::getInternalUser)
					.map(User::getUserId)
					.filter(userId -> userId.equals(currentUser.getUserId()))
					.isPresent();

				if (!isEnvelopeOwner) {
					throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
				}
			}
		}
	}

	private String generateSignatureCertificateHtml(SignatureCertificateResponseDto responseDto) {
		StringBuilder htmlBuilder = new StringBuilder();

		// HTML structure with proper XML formatting for OpenHTMLToPDF
		htmlBuilder.append("<!DOCTYPE html>");
		htmlBuilder.append("<html><head>");
		htmlBuilder.append("<meta charset='UTF-8'/>");
		htmlBuilder.append(
				"<link href='https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&amp;display=swap' rel='stylesheet' />");
		htmlBuilder.append("<style>");

		// CSS Styles optimized for OpenHTMLToPDF
		htmlBuilder.append("@page { ");
		htmlBuilder.append("  size: A4; ");
		htmlBuilder.append("  margin: 40px; ");
		htmlBuilder.append("  @bottom-right { ");
		htmlBuilder.append("    content: 'Page ' counter(page) '/' counter(pages); ");
		htmlBuilder.append("    font-size: 11px; ");
		htmlBuilder.append("    font-family: 'Poppins', sans-serif; ");
		htmlBuilder.append("    color: #666; ");
		htmlBuilder.append("  } ");
		htmlBuilder.append("} ");

		htmlBuilder.append("body { ");
		htmlBuilder.append("  font-family: 'Poppins', sans-serif; ");
		htmlBuilder.append("  margin: 0; ");
		htmlBuilder.append("  padding: 20px; ");
		htmlBuilder.append("  font-size: 14px; ");
		htmlBuilder.append("  line-height: 1.4; ");
		htmlBuilder.append("  color: #333; ");
		htmlBuilder.append("  background: white; ");
		htmlBuilder.append("} ");

		// Header styles
		htmlBuilder.append(".header { ");
		htmlBuilder.append("  width: 100%; ");
		htmlBuilder.append("  margin-bottom: 40px; ");
		htmlBuilder.append("  position: relative; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".header-table { ");
		htmlBuilder.append("  width: 100%; ");
		htmlBuilder.append("  border-collapse: collapse; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".title { ");
		htmlBuilder.append("  font-family: 'Poppins', sans-serif; ");
		htmlBuilder.append("  font-size: 20px; ");
		htmlBuilder.append("  font-weight: 600; ");
		htmlBuilder.append("  color: #000; ");
		htmlBuilder.append("  margin: 0; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".logo { ");
		htmlBuilder.append("  text-align: right; ");
		htmlBuilder.append("  font-family: 'Poppins', sans-serif; ");
		htmlBuilder.append("  font-size: 14px; ");
		htmlBuilder.append("  font-weight: 600; ");
		htmlBuilder.append("  color: #f97316; ");
		htmlBuilder.append("} ");

		// Document info styles
		htmlBuilder.append(".doc-section { ");
		htmlBuilder.append("  margin-bottom: 5px; ");
		htmlBuilder.append("  position: relative; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".doc-header-table { ");
		htmlBuilder.append("  width: 100%; ");
		htmlBuilder.append("  border-collapse: collapse; ");
		htmlBuilder.append("  margin-bottom: 5px; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".doc-name { ");
		htmlBuilder.append("  font-family: 'Poppins', sans-serif; ");
		htmlBuilder.append("  font-size: 18px; ");
		htmlBuilder.append("  font-weight: 600; ");
		htmlBuilder.append("  margin: 0 0 5px 0; ");
		htmlBuilder.append("  color: #000; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".doc-id { ");
		htmlBuilder.append("  font-family: 'Poppins', sans-serif; ");
		htmlBuilder.append("  font-size: 12px; ");
		htmlBuilder.append("  color: #666; ");
		htmlBuilder.append("  margin: 0; ");
		htmlBuilder.append("} ");

		// Status badge styles
		htmlBuilder.append(".status-badge { ");
		htmlBuilder.append("  text-align: right; ");
		htmlBuilder.append("  vertical-align: top; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".status-content { ");
		htmlBuilder.append("  font-family: 'Poppins', sans-serif; ");
		htmlBuilder.append("  display: inline-block; ");
		htmlBuilder.append("  width: 130px; ");
		htmlBuilder.append("  padding: 8px 12px; ");
		htmlBuilder.append("  box-sizing: border-box; ");
		htmlBuilder.append("  background: #f0f0f0; ");
		htmlBuilder.append("  border-radius: 16px; ");
		htmlBuilder.append("  font-size: 12px; ");
		htmlBuilder.append("  color: #333; ");
		htmlBuilder.append("  text-align: center; ");
		htmlBuilder.append("  line-height: 1.2; ");
		htmlBuilder.append("  display: flex; ");
		htmlBuilder.append("  align-items: center; ");
		htmlBuilder.append("  justify-content: center; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".status-dot { ");
		htmlBuilder.append("  display: inline-block; ");
		htmlBuilder.append("  width: 8px; ");
		htmlBuilder.append("  height: 8px; ");
		htmlBuilder.append("  border-radius: 50%; ");
		htmlBuilder.append("  margin-right: 6px; ");
		htmlBuilder.append("  flex-shrink: 0; ");
		htmlBuilder.append("} ");

		// Status-specific dot styles
		htmlBuilder.append(".status-dot.completed { ");
		htmlBuilder.append("  background: #22c55e; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".status-dot.waiting { ");
		htmlBuilder.append("  border: 2px solid #f59e0b; ");
		htmlBuilder.append("  background: transparent; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".status-dot.need-to-sign { ");
		htmlBuilder.append("  border: 2px solid #22c55e; ");
		htmlBuilder.append("  background: transparent; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".status-dot.declined { ");
		htmlBuilder.append("  border: 2px solid #ef4444; ");
		htmlBuilder.append("  background: transparent; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".status-dot.expired { ");
		htmlBuilder.append("  background: #ef4444; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".status-dot.voided { ");
		htmlBuilder.append("  background: #374151; ");
		htmlBuilder.append("} ");

		// Meta information styles
		htmlBuilder.append(".meta-section { ");
		htmlBuilder.append("  margin-bottom: 10px; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".meta-table { ");
		htmlBuilder.append("  width: 100%; ");
		htmlBuilder.append("  border-collapse: collapse; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".meta-table td { ");
		htmlBuilder.append("  padding: 8px 0; ");
		htmlBuilder.append("  vertical-align: top; ");
		htmlBuilder.append("  width: 50%; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".meta-label { ");
		htmlBuilder.append("  font-family: 'Poppins', sans-serif; ");
		htmlBuilder.append("  font-weight: 600; ");
		htmlBuilder.append("  color: #000; ");
		htmlBuilder.append("  font-size: 14px; ");
		htmlBuilder.append("  margin-bottom: 4px; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".meta-value { ");
		htmlBuilder.append("  font-family: 'Poppins', sans-serif; ");
		htmlBuilder.append("  font-weight: 400; ");
		htmlBuilder.append("  color: #666; ");
		htmlBuilder.append("  font-size: 14px; ");
		htmlBuilder.append("} ");

		// Activities section styles
		htmlBuilder.append(".activities-title { ");
		htmlBuilder.append("  font-family: 'Poppins', sans-serif; ");
		htmlBuilder.append("  font-weight: 600; ");
		htmlBuilder.append("  font-size: 16px; ");
		htmlBuilder.append("  margin-bottom: 5px; ");
		htmlBuilder.append("  color: #000; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".activities-table { ");
		htmlBuilder.append("  width: 100%; ");
		htmlBuilder.append("  border-collapse: collapse; ");
		htmlBuilder.append("  font-size: 13px; ");
		htmlBuilder.append("  font-family: 'Poppins', sans-serif; ");
		htmlBuilder.append("  -fs-table-paginate: paginate; "); // OpenHTMLToPDF specific
																// property for table
																// pagination
		htmlBuilder.append("} ");

		htmlBuilder.append(".activities-table thead { ");
		htmlBuilder.append("  background: #f8f9fa; ");
		htmlBuilder.append("  display: table-header-group; "); // Ensures header repeats
																// on each page
		htmlBuilder.append("} ");

		htmlBuilder.append(".activities-table th { ");
		htmlBuilder.append("  font-family: 'Poppins', sans-serif; ");
		htmlBuilder.append("  text-align: left; ");
		htmlBuilder.append("  padding: 10px 8px; ");
		htmlBuilder.append("  font-weight: 600; ");
		htmlBuilder.append("  color: #000; ");
		htmlBuilder.append("  border-bottom: 1px solid #e0e0e0; ");
		htmlBuilder.append("  font-size: 13px; ");
		htmlBuilder.append("} ");

		htmlBuilder.append(".activities-table tbody { ");
		htmlBuilder.append("  display: table-row-group; "); // Ensures proper tbody
															// behavior for pagination
		htmlBuilder.append("} ");

		htmlBuilder.append(".activities-table td { ");
		htmlBuilder.append("  font-family: 'Poppins', sans-serif; ");
		htmlBuilder.append("  padding: 8px; ");
		htmlBuilder.append("  border-bottom: 1px solid #f0f0f0; ");
		htmlBuilder.append("  color: #666; ");
		htmlBuilder.append("  font-size: 13px; ");
		htmlBuilder.append("  font-weight: 400; ");
		htmlBuilder.append("} ");

		htmlBuilder.append("</style>");
		htmlBuilder.append("</head><body>");

		// Header
		htmlBuilder.append("<div class='header'>");
		htmlBuilder.append("<table class='header-table'>");
		htmlBuilder.append("<tr>");
		htmlBuilder.append("<td><h1 class='title'>Document History</h1></td>");
		htmlBuilder.append(
				"<td class='logo'><img alt='Skapp Logo' src='http://images.skapp.com/logo-with-name-1.png' style='width: 81px; height: 35'/></td>");
		htmlBuilder.append("</tr>");
		htmlBuilder.append("</table>");
		htmlBuilder.append("</div>");

		// Document info section
		htmlBuilder.append("<div class='doc-section'>"); // Reduced margin
		htmlBuilder.append("<table class='doc-header-table'>");
		htmlBuilder.append("<tr>");
		htmlBuilder.append("<td>");
		htmlBuilder.append("<h2 class='doc-name'>").append(escapeHtml(responseDto.getName())).append("</h2>");
		htmlBuilder.append("<p class='doc-id'>").append(escapeHtml(responseDto.getUuid())).append("</p>");
		htmlBuilder.append("</td>");
		htmlBuilder.append("<td class='status-badge'>");

		String statusClass = getStatusClass(responseDto.getStatus());
		String statusLabel = getStatusLabel(responseDto.getStatus());
		htmlBuilder.append("<div class='status-content'>");
		htmlBuilder.append("<span class='status-dot ").append(statusClass).append("'></span>");
		htmlBuilder.append(
				"<span style='display: inline-block; vertical-align: middle; font-size: 14px; position: relative; top: -1px;'>")
			.append(statusLabel)
			.append("</span>");
		htmlBuilder.append("</div>");
		htmlBuilder.append("</td>");
		htmlBuilder.append("</tr>");
		htmlBuilder.append("</table>");
		htmlBuilder.append("</div>");

		// Add horizontal line between document info and meta information sections
		htmlBuilder.append("<hr style='border: 0; border-top: 1px solid #e0e0e0; margin: 10px 0;' />"); // Reduced
																										// margin

		// Meta information section
		htmlBuilder.append("<div class='meta-section'>");
		htmlBuilder.append("<table class='meta-table'>");

		// First row: Sender and Enclosed Documents
		htmlBuilder.append("<tr>");
		htmlBuilder.append("<td>");
		htmlBuilder.append("<div class='meta-label'>Sender</div>");
		htmlBuilder.append("<div class='meta-value'>")
			.append(escapeHtml(responseDto.getOwner().getName()))
			.append("</div>");
		htmlBuilder.append("</td>");
		htmlBuilder.append("<td>");
		htmlBuilder.append("<div class='meta-label'>Enclosed Documents</div>");
		htmlBuilder.append("<div class='meta-value'>")
			.append(escapeHtml(responseDto.getDocuments().getFirst().getName()))
			.append("</div>");
		htmlBuilder.append("</td>");
		htmlBuilder.append("</tr>");

		// Second row: Date Created and Time Zone
		htmlBuilder.append("<tr>");
		htmlBuilder.append("<td>");
		htmlBuilder.append("<div class='meta-label'>Date Created</div>");
		htmlBuilder.append("<div class='meta-value'>").append(formatDate(responseDto.getSentAt())).append("</div>");
		htmlBuilder.append("</td>");
		htmlBuilder.append("<td>");
		htmlBuilder.append("<div class='meta-label'>Time Zone</div>");
		htmlBuilder.append("<div class='meta-value'>")
			.append(escapeHtml(responseDto.getOrganizationTimeZone()))
			.append("</div>");
		htmlBuilder.append("</td>");
		htmlBuilder.append("</tr>");

		// Third row: Recipients (spans both columns)
		htmlBuilder.append("<tr>");
		htmlBuilder.append("<td colspan='2'>");
		htmlBuilder.append("<div class='meta-label'>Recipients</div>");
		htmlBuilder.append("<div class='meta-value'>");
		String recipients = responseDto.getRecipients()
			.stream()
			.map(recipient -> recipient.getAddressBook().getFirstName() + " "
					+ recipient.getAddressBook().getLastName())
			.collect(Collectors.joining(", "));
		htmlBuilder.append(escapeHtml(recipients));
		htmlBuilder.append("</div>");
		htmlBuilder.append("</td>");
		htmlBuilder.append("</tr>");

		htmlBuilder.append("</table>");
		htmlBuilder.append("</div>");

		// Activities section
		htmlBuilder.append("<h3 class='activities-title'>Activities</h3>");

		// Add horizontal line between document info and meta information sections
		htmlBuilder.append("<hr style='border: 0; border-top: 1px solid #e0e0e0; margin: 10px 0;' />");

		htmlBuilder.append("<table class='activities-table'>");
		htmlBuilder.append("<thead>");
		htmlBuilder.append("<tr>");
		htmlBuilder.append("<th style='width: 28%;'>Time</th>");
		htmlBuilder.append("<th style='width: 35%;'>User</th>");
		htmlBuilder.append("<th style='width: 40%;'>Activity</th>");
		htmlBuilder.append("</tr>");
		htmlBuilder.append("</thead>");
		htmlBuilder.append("<tbody>");

		if (responseDto.getAuditTrails() != null && !responseDto.getAuditTrails().isEmpty()) {
			for (AuditTrailResponseDto audit : responseDto.getAuditTrails()) {
				htmlBuilder.append("<tr>");
				htmlBuilder.append("<td>").append(escapeHtml(formatTimestamp(audit.getTimestamp()))).append("</td>");
				htmlBuilder.append("<td>").append(escapeHtml(audit.getActionDoneByName())).append("</td>");
				htmlBuilder.append("<td>").append(escapeHtml(getFormattedActionText(audit))).append("</td>");
				htmlBuilder.append("</tr>");
			}
		}

		htmlBuilder.append("</tbody>");
		htmlBuilder.append("</table>");

		htmlBuilder.append("</body></html>");

		return htmlBuilder.toString();
	}

	// Helper methods to match the design
	private String getStatusClass(EnvelopeStatus status) {
		switch (status) {
			case COMPLETED:
				return "completed"; // Green filled dot
			case WAITING:
				return "waiting"; // Orange outlined dot
			case NEED_TO_SIGN:
				return "need-to-sign"; // Green outlined dot
			case VOIDED:
				return "voided"; // Dark filled dot
			case DECLINED:
				return "declined"; // Red outlined dot
			case EXPIRED:
				return "expired"; // Red filled dot
			default:
				return "completed";
		}
	}

	private String getStatusLabel(EnvelopeStatus status) {
		switch (status) {
			case COMPLETED:
				return "Completed";
			case WAITING:
				return "Waiting";
			case NEED_TO_SIGN:
				return "Need to sign";
			case VOIDED:
				return "Voided";
			case DECLINED:
				return "Declined";
			case EXPIRED:
				return "Expired";
			default:
				return status.name();
		}
	}

	private String escapeHtml(String text) {
		if (text == null)
			return "";
		return text.replace("&", "&amp;")
			.replace("<", "&lt;")
			.replace(">", "&gt;")
			.replace("\"", "&quot;")
			.replace("'", "&#39;");
	}

	private String getFormattedActionText(AuditTrailResponseDto audit) {
		String actionBy = audit.getActionDoneByName() != null ? audit.getActionDoneByName() : "";

		switch (audit.getAction()) {
			case ENVELOPE_CREATED:
				return actionBy + " created the document";
			case ENVELOPE_SENT:
				return actionBy + " sent the document";
			case ENVELOPE_VIEWED:
				return actionBy + " viewed the document";
			case ENVELOPE_SIGNED:
				return actionBy + " signed the document";
			case ENVELOPE_COMPLETED:
				return "Document is completed";
			case ENVELOPE_VOIDED:
				return "Document made void";
			case ENVELOPE_DECLINED:
				return actionBy + " declined to sign";
			case ENVELOPE_EXPIRED:
				return "Document expired";
			case ENVELOPE_DOWNLOADED:
				return actionBy + " downloaded the document";
			case ENVELOPE_CUSTODY_TRANSFERRED:
				String newOwner = "";
				if (audit.getMetadata() != null && !audit.getMetadata().isEmpty()) {
					for (MetadataResponseDto metadata : audit.getMetadata()) {
						if ("currentOwner".equals(metadata.getName())) {
							newOwner = metadata.getValue();
							break;
						}
					}
				}
				return actionBy + " transferred ownership to " + newOwner;
			default:
				return audit.getAction().toString();
		}
	}

	private String formatDate(LocalDateTime localDateTime) {
		// Format according to your requirements
		return DateTimeUtils.formatDateTimeEsignCert(localDateTime);
	}

	private String formatTimestamp(Instant instant) {
		// Format according to your requirements
		return DateTimeUtils.formatInstantEsignCert(instant);
	}

	private EnvelopeInfoResponseDto getEnvelopeInfoResponseDto(Envelope envelope) {
		EnvelopeInfoResponseDto envelopeInfoResponseDto = new EnvelopeInfoResponseDto();
		envelopeInfoResponseDto.setId(envelope.getId());
		envelopeInfoResponseDto.setSubject(envelope.getSubject());
		envelopeInfoResponseDto.setMessage(envelope.getMessage());
		envelopeInfoResponseDto.setStatus(envelope.getStatus());
		envelopeInfoResponseDto.setSignType(envelope.getSignType());

		List<Recipient> recipients = envelope.getRecipients();
		List<RecipientResponseDto> recipientResponseDtos = eSignMapper.recipientToRecipinetResponseDtoList(recipients);
		formatDeletedEmail(recipientResponseDtos);
		envelopeInfoResponseDto.setRecipients(recipientResponseDtos);

		List<DocumentDetailResponseDto> documentDetails = getDocumentDetails(envelope);
		AddressBook addressBook = envelope.getOwner();

		AddressBookBasicResponseDto addressBookBasicResponseDto = eSignMapper
			.addressBookToAddressBookBasicResponseDto(addressBook);
		envelopeInfoResponseDto.setAddressBook(addressBookBasicResponseDto);

		envelopeInfoResponseDto.setDocuments(documentDetails);
		return envelopeInfoResponseDto;
	}

	private EnvelopeInboxInfoResponseDto getEnvelopeInboxInfoResponseDto(Envelope envelope, Recipient recipient) {
		EnvelopeInboxInfoResponseDto envelopeInboxInfoResponseDto = new EnvelopeInboxInfoResponseDto();
		envelopeInboxInfoResponseDto.setId(envelope.getId());
		envelopeInboxInfoResponseDto.setSubject(envelope.getSubject());
		envelopeInboxInfoResponseDto.setMessage(envelope.getMessage());
		envelopeInboxInfoResponseDto.setStatus(recipient.getInboxStatus());
		envelopeInboxInfoResponseDto.setSignType(envelope.getSignType());

		List<Recipient> recipients = envelope.getRecipients();
		List<RecipientResponseDto> recipientResponseDtos = eSignMapper.recipientToRecipinetResponseDtoList(recipients);
		formatDeletedEmail(recipientResponseDtos);
		envelopeInboxInfoResponseDto.setRecipients(recipientResponseDtos);

		List<DocumentDetailResponseDto> documentDetails = getDocumentDetails(envelope);
		AddressBook addressBook = recipient.getAddressBook();
		AddressBook senderAddressBook = envelope.getOwner();

		AddressBookBasicResponseDto addressBookBasicResponseDto = eSignMapper
			.addressBookToAddressBookBasicResponseDto(addressBook);
		envelopeInboxInfoResponseDto.setAddressBook(addressBookBasicResponseDto);

		AddressBookBasicResponseDto senderAddressBookResponseDto = eSignMapper
			.addressBookToAddressBookBasicResponseDto(senderAddressBook);
		envelopeInboxInfoResponseDto.setSenderAddressBook(senderAddressBookResponseDto);

		envelopeInboxInfoResponseDto.setDocuments(documentDetails);
		return envelopeInboxInfoResponseDto;
	}

	private static void formatDeletedEmail(List<RecipientResponseDto> recipientResponseDtos) {
		// Clean up deleted external user email addresses
		recipientResponseDtos.forEach(dto -> {
			if (dto.getAddressBook() != null && dto.getAddressBook().getEmail() != null
					&& dto.getAddressBook().getEmail().startsWith(PeopleConstants.DELETED_PREFIX)) {

				String originalEmail = dto.getAddressBook().getEmail();
				String cleanedEmail = originalEmail
					.replaceFirst(Pattern.quote(PeopleConstants.DELETED_PREFIX) + "\\d+_", "");
				dto.getAddressBook().setEmail(cleanedEmail);
			}
		});
	}

	public List<DocumentDetailResponseDto> getDocumentDetails(Envelope envelope) {
		return envelope.getDocuments().stream().map(document -> {
			int currentVersion = document.getCurrentVersion();
			DocumentVersion documentVersion = documentVersionRepository
				.findFirstByVersionNumberAndDocumentIdOrderByIdDesc(currentVersion, document.getId())
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
				addressBook, ipAddress, null);
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
	public ResponseEntityDto transferEnvelopeCustody(Long envelopeId, Long addressbookId, String ipAddress) {
		return transferEnvelopeCustody(envelopeId, addressbookId, ipAddress, false);
	}

	public ResponseEntityDto transferEnvelopeCustody(Long envelopeId, Long addressbookId, String ipAddress,
			boolean isAuto) {
		log.info("transferEnvelopeCustody: execution started for envelope ID: {}", envelopeId);

		Envelope envelope = envelopeDao.findById(envelopeId)
			.orElseThrow(() -> new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND));

		AddressBook addressBook = null;
		if (!isAuto) {
			User currentUser = userService.getCurrentUser();
			if (currentUser == null) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
			}

			Role esignRole = currentUser.getEmployee().getEmployeeRole().getEsignRole();

			if (esignRole.equals(Role.ESIGN_SENDER)) {
				AddressBook owner = envelope.getOwner();
				if (!owner.getInternalUser().getUserId().equals(currentUser.getUserId())) {
					throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
				}
			}

			addressBook = addressBookDao.findByInternalUser(currentUser)
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND));
		}

		AddressBook newOwner = addressBookDao.findById(addressbookId)
			.orElseThrow(() -> new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_ID_NOT_FOUND));

		if (envelope.getOwner().getId().equals(addressbookId)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_USER_ALREADY_OWNER_OF_ENVELOPE);
		}

		Document document = documentDao.findByEnvelopeId(envelope.getId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		EnvelopeStatus status = envelope.getStatus();

		// First always process version 1 document
		DocumentVersion firstVersion = documentVersionRepository.findByVersionNumberAndDocumentId(1, document.getId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));

		// Update version 1 to -1
		firstVersion.setVersionNumber(-1);
		documentVersionRepository.save(firstVersion);

		processDocumentCustodyTransfer(firstVersion, newOwner, 1);

		if (status != EnvelopeStatus.WAITING && status != EnvelopeStatus.DECLINED && status != EnvelopeStatus.VOIDED) {
			int currentVersionNumber = document.getCurrentVersion();

			if (currentVersionNumber > 1) {
				DocumentVersion currentVersion = documentVersionRepository
					.findByVersionNumberAndDocumentId(currentVersionNumber, document.getId())
					.orElseThrow(
							() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));

				if (!Objects.equals(currentVersion.getId(), firstVersion.getId())) {
					// Update last completed version to -2
					currentVersion.setVersionNumber(-2);
					documentVersionRepository.save(currentVersion);
					processDocumentCustodyTransfer(currentVersion, newOwner, currentVersionNumber);
				}
			}
		}

		// Update envelope owner
		envelope.setOwner(newOwner);
		envelopeDao.save(envelope);

		// Create audit trail
		ObjectMapper objectMapper = new ObjectMapper();
		ArrayNode metadata = objectMapper.createArrayNode();
		ObjectNode currentOwnerNode = objectMapper.createObjectNode();
		currentOwnerNode.put("name", "currentOwner");
		currentOwnerNode.put("value", newOwner.getName());
		metadata.add(currentOwnerNode);

		AuditTrail auditTrail = auditTrailService.processAuditTrailInfo(envelope, null,
				AuditAction.ENVELOPE_CUSTODY_TRANSFERRED, addressBook, ipAddress, metadata);
		auditTrailDao.save(auditTrail);

		log.info("transferEnvelopeCustody: execution ended for envelope ID: {}", envelopeId);
		return new ResponseEntityDto(false, "Envelope custody transferred successfully.");
	}

	private void processDocumentCustodyTransfer(DocumentVersion sourceVersion, AddressBook newOwner,
			int newVersionNumber) {
		KeyPair keyPairVerify = documentService.loadKeyPair(sourceVersion.getAddressBook().getId());

		byte[] documentBytes = amazonS3Service.downloadFileAsBytes(bucketName, sourceVersion.getFilePath());

		documentService.verifyDocumentSignature(documentBytes, sourceVersion, keyPairVerify.getPublic());

		String newHash = documentService.hashDocument(new ByteArrayInputStream(documentBytes));

		KeyPair keyPairSign = documentService.loadKeyPair(newOwner.getId());

		String signature = documentService.signDocument(Base64.getDecoder().decode(newHash), keyPairSign.getPrivate());

		String fileUrl = sourceVersion.getFilePath();

		DocumentVersion newVersion = documentService.buildNewDocumentVersion(sourceVersion, fileUrl, newHash, signature,
				newOwner);
		newVersion.setVersionNumber(newVersionNumber);

		documentVersionRepository.save(newVersion);

	}

	@Transactional
	@Override
	public void transferEmployeeEnvelopes(List<Employee> employees) {
		log.info("transferEmployeeEnvelopes: execution started for {} employees", employees.size());

		// Find the address book of the oldest active super admin in the tenant
		List<AccountStatus> validStatuses = Arrays.asList(AccountStatus.PENDING, AccountStatus.ACTIVE);
		List<EmployeeRole> superAdmins = epEmployeeRoleDao
			.findEmployeeRoleByIsSuperAdminAndEmployeeAccountStatusIn(true, validStatuses);

		// Sort by creation date (oldest first)
		superAdmins.sort(Comparator.comparing(role -> role.getEmployee().getCreatedDate()));

		// Get the oldest super admin's address book ID
		AddressBook oldestSuperAdminAddressBook = addressBookDao
			.findByInternalUserUserId(superAdmins.getFirst().getEmployee().getEmployeeId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND));

		for (Employee employeeList : employees) {
			// Find employee's address book
			Optional<AddressBook> addressBookOptional = addressBookDao
				.findByInternalUserUserId(employeeList.getEmployeeId());

			AddressBook employeeAddressBook = addressBookOptional.get();

			List<Envelope> employeeEnvelopes = envelopeDao.findByOwner(employeeAddressBook);

			log.info("Processing {} envelopes for employee ID: {}", employeeEnvelopes.size(),
					employeeList.getEmployeeId());

			if (!employeeEnvelopes.isEmpty()) {
				for (Envelope envelope : employeeEnvelopes) {
					transferEnvelopeCustody(envelope.getId(), oldestSuperAdminAddressBook.getId(), null, true);
				}
			}

		}

		log.info("transferEmployeeEnvelopes: execution ended");
	}

	@Transactional
	@Override
	public ResponseEntityDto declineEnvelope(Long recipientId, DeclineEnvelopeRequestDto declineEnvelopeRequestDto,
			boolean isDocAccess, String ipAddress) {

		log.info("declineEnvelope: execution started for recipient ID: {}", recipientId);

		Recipient recipient = recipientRepository.findById(recipientId).orElseThrow(() -> {
			log.error("Recipient with ID {} not found", recipientId);
			return new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND);
		});

		documentLinkService.validateTokenFlows(isDocAccess, recipient, null);

		Envelope envelope = envelopeDao.findById(recipient.getEnvelope().getId()).orElseThrow(() -> {
			log.error("Envelope with ID {} not found for recipient ID {}", recipient.getEnvelope().getId(),
					recipientId);
			return new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		});

		if (EnvelopeStatus.isDeclineProhibitedFrom(envelope.getStatus())) {
			log.warn("declineEnvelope: decline prohibited for envelope ID {} with status {}", envelope.getId(),
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
				AuditAction.ENVELOPE_DECLINED, null, ipAddress, null);
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

				if (recipient.getReminderBatchId() != null
						&& recipient.getReminderStatus() == EmailReminderStatus.SCHEDULED) {
					recipientService.cancelEmailReminders(recipient.getId(), envelope.getId());
				}
				recipient.setReminderStatus(EmailReminderStatus.CANCELLED);
			});

			envelopeDao.save(envelope);

			AuditTrail auditTrail = auditTrailService.processAuditTrailInfo(envelope, null,
					AuditAction.ENVELOPE_EXPIRED, null, null, null);
			auditTrailDao.save(auditTrail);

			log.info("Envelope ID: {} marked as EXPIRED in tenant: {}", envelopeId, TenantContext.getCurrentTenant());
		}

	}

	@Override
	public ResponseEntityDto getEnvelopeTierLimitations() {
		EnvelopeTierLimitationResponseDto envelopeTierLimitationResponseDto = processEnvelopeTierLimitation();
		return new ResponseEntityDto(false, envelopeTierLimitationResponseDto);
	}

	private EnvelopeTierLimitationResponseDto processEnvelopeTierLimitation() {
		String currentTenant = TenantContext.getCurrentTenant();
		try {
			long employeeCount = employeeDao
				.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
			Tenant tenant = tenantDao.findByTenantName(currentTenant);
			tenantContext.setTenantAndSwitchSchema(currentTenant);

			if (tenant == null) {
				log.error("getEnvelopeTierLimitations: Tenant not found: {}", currentTenant);
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_NOT_FOUND,
						new String[] { currentTenant });
			}

			EnvelopeTierLimitationResponseDto envelopeTierLimitationResponseDto = new EnvelopeTierLimitationResponseDto();
			Tier tier = tenant.getTier();

			LocalDateTime startDateTime;
			LocalDateTime endDateTime;
			long allocatedCount;

			if (tier == Tier.FREE) {
				LocalDate tierStartedDate = DateTimeUtils.fromUtcInstantToLocaldate(tenant.getCreatedDate());
				startDateTime = getYearlyTierStartDate(tierStartedDate);
				endDateTime = getYearlyTierEndDate(startDateTime, tierStartedDate);

				long envelopeCount = envelopeDao.countBySentAtGreaterThanEqualAndSentAtLessThan(startDateTime,
						endDateTime);
				allocatedCount = allocatedFreeTierEnvelopeCount;

				envelopeTierLimitationResponseDto.setAllocatedCount(allocatedCount);
				envelopeTierLimitationResponseDto.setRemainingCount(Math.max(allocatedCount - envelopeCount, 0));
				envelopeTierLimitationResponseDto.setLimitedReached(envelopeCount >= allocatedFreeTierEnvelopeCount);
			}
			else if (tier == Tier.PRO) {

				if (tenant.getStripeSubscription() == null
						|| tenant.getStripeSubscription().getSubscriptionStartDate() == null) {
					throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_NOT_FOUND);
				}
				LocalDate tierStartedDate = DateTimeUtils
					.fromUtcInstantToLocaldate(tenant.getStripeSubscription().getSubscriptionStartDate());

				startDateTime = getYearlyTierStartDate(tierStartedDate);
				endDateTime = getYearlyTierEndDate(startDateTime, tierStartedDate);

				long envelopeCount = envelopeDao.countBySentAtGreaterThanEqualAndSentAtLessThan(startDateTime,
						endDateTime);

				allocatedCount = Math.max(envelopeCount, employeeCount * allocatedPerUserEnvelopeCount);
				long remainingCount = allocatedCount - envelopeCount;

				envelopeTierLimitationResponseDto.setAllocatedCount(allocatedCount);
				envelopeTierLimitationResponseDto.setRemainingCount(Math.max(remainingCount, 0));
				envelopeTierLimitationResponseDto
					.setLimitedReached(envelopeCount >= (employeeCount * allocatedPerUserEnvelopeCount));
			}
			return envelopeTierLimitationResponseDto;
		}
		catch (Exception e) {
			log.error("Error while fetching envelope tier limitations for tenant {}: {}", currentTenant, e.getMessage(),
					e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FETCHING_ENVELOPE_TIER_LIMITATIONS);
		}
		finally {
			tenantContext.setTenantAndSwitchSchema(currentTenant);
		}
	}

	private LocalDateTime getYearlyTierStartDate(LocalDate tierStartedDate) {
		LocalDate today = DateTimeUtils.getCurrentUtcDate();
		int year = today.getYear();
		LocalDate thisYearStart = getCurrentYearStartDate(tierStartedDate, year);
		if (today.isBefore(thisYearStart)) {
			thisYearStart = getCurrentYearStartDate(tierStartedDate, year - 1);
		}
		return thisYearStart.atStartOfDay();
	}

	private LocalDate getCurrentYearStartDate(LocalDate tierStartedDate, int year) {
		int month = tierStartedDate.getMonthValue();
		int day = tierStartedDate.getDayOfMonth();
		if (month == FEBRUARY.getValue() && day == LEAP_DAY) {
			return Year.isLeap(year) ? LocalDate.of(year, FEBRUARY, LEAP_DAY) : LocalDate.of(year, MARCH, FIRST_DAY);
		}
		else {
			return LocalDate.of(year, month, day);
		}
	}

	private LocalDateTime getYearlyTierEndDate(LocalDateTime startDateTime, LocalDate tierStartedDate) {
		int year = startDateTime.getYear() + 1;
		if (tierStartedDate.getMonthValue() == FEBRUARY.getValue() && tierStartedDate.getDayOfMonth() == LEAP_DAY) {
			if (Year.isLeap(year)) {
				return LocalDate.of(year, FEBRUARY, LEAP_DAY).atStartOfDay();
			}
			else {
				return LocalDate.of(year, MARCH, FIRST_DAY).atStartOfDay();
			}
		}
		else {
			return startDateTime.plusYears(1);
		}
	}

}
