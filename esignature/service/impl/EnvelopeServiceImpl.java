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
import com.skapp.community.common.repository.UserDao;
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
import com.skapp.enterprise.esignature.payload.request.EnvelopeNextFilterDto;
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
import com.skapp.enterprise.esignature.repository.DocumentVersionDao;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.repository.projection.EnvelopeInboxData;
import com.skapp.enterprise.esignature.repository.projection.EnvelopeNextData;
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
import com.skapp.enterprise.esignature.util.EsignUtil;
import com.skapp.enterprise.people.repository.EpEmployeeRoleDao;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyPair;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Month;
import java.time.Year;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
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

	private final UserDao userDao;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	@Value("${esign.envelope.allocated-free-tier-envelope-count}")
	private long allocatedFreeTierEnvelopeCount;

	@Value("${esign.envelope.allocated-per-user-envelope-count}")
	private long allocatedPerUserEnvelopeCount;

	@Value("${aws.cloudfront.s3-default.domain-name}")
	private String cloudFrontDomain;

	public static final String HTTPS_PROTOCOL = "https://";

	private final EsignMapper eSignMapper;

	private final EnvelopeDao envelopeDao;

	private final UserService userService;

	private final DocumentDao documentDao;

	private final AddressBookDao addressBookDao;

	private final RecipientService recipientService;

	private final DocumentService documentService;

	private final DocumentLinkService documentLinkService;

	private final DocumentVersionDao documentVersionDao;

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

		documentVersionDao.saveAll(documentVersionList);

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

		auditTrailDao.saveAll(auditTrails);

		EnvelopeDetailedResponseDto responseDto = eSignMapper.envelopeToEnvelopeDetailedResponseDto(savedEnvelope);

		LocalDateTime sentAtTime = responseDto.getSentAt();

		// Register a post-commit callback to handle scheduling after transaction commit
		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				String tenantId = TenantContext.getCurrentTenant();
				if (!envelope.getStatus().equals(EnvelopeStatus.COMPLETED)) {
					scheduleService.scheduleExpiration(savedEnvelope.getId(), tenantId, QuartzEntityType.ENVELOPE,
							LocalDateTime.of(envelopeDetailDto.getEnvelopeSettingDto().getExpirationDate(),
									sentAtTime != null ? sentAtTime.toLocalTime() : LocalTime.MAX));
				}
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
		envelope.setSentAt(getCurrentUtcDateTime());
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

			Recipient currentUserRecipient = orderedRecipients.stream()
				.filter(r -> r.getAddressBook().getInternalUser() != null
						&& Objects.equals(r.getAddressBook().getInternalUser().getUserId(), currentUser.getUserId()))
				.toList()
				.getFirst();

			if (currentUserRecipient != null) {
				envelopeInboxData.setStatus(currentUserRecipient.getInboxStatus());
				envelopeInboxData.setReceivedDate(currentUserRecipient.getReceivedAt());
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
	public ResponseEntityDto getAllUserEnvelopesByUserId(EnvelopeInboxFilterDto envelopeInboxFilterDto, Long userId) {
		log.info("getAllUserEnvelopesByUserId: execution started");

		User currentUser = userDao.findById(userId).orElse(null);
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

			Recipient currentUserRecipient = orderedRecipients.stream()
				.filter(r -> r.getAddressBook().getInternalUser() != null
						&& Objects.equals(r.getAddressBook().getInternalUser().getUserId(), currentUser.getUserId()))
				.toList()
				.getFirst();

			if (currentUserRecipient != null) {
				envelopeInboxData.setStatus(currentUserRecipient.getInboxStatus());
				envelopeInboxData.setReceivedDate(currentUserRecipient.getReceivedAt());
			}

			envelopeInboxDataList.add(envelopeInboxData);
		});

		PageDto pageDto = new PageDto();
		pageDto.setItems(envelopeInboxDataList);
		pageDto.setCurrentPage(envelopePage.getNumber());
		pageDto.setTotalItems(envelopePage.getTotalElements());
		pageDto.setTotalPages(envelopePage.getTotalPages());

		log.info("getAllUserEnvelopesByUserId: execution ended");

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
				auditTrailResponseDto.setActionDoneByEmail("");
			}
			else if (auditTrail.getRecipient() == null) {
				auditTrailResponseDto.setActionDoneByName(auditTrail.getAddressBookUser().getName());
				auditTrailResponseDto.setActionDoneByEmail(auditTrail.getAddressBookUser().getEmail());
			}
			else {
				auditTrailResponseDto.setActionDoneByName(auditTrail.getRecipient().getAddressBook().getName());
				auditTrailResponseDto.setActionDoneByEmail(auditTrail.getRecipient().getAddressBook().getEmail());
			}
			auditTrailResponseDto.setTimestamp(auditTrail.getTimestamp());
			return auditTrailResponseDto;
		}).toList();

		organizationDao.findTopByOrderByOrganizationIdDesc()
			.ifPresent(org -> responseDto.setOrganizationTimeZone(org.getOrganizationTimeZone()));
		responseDto.setAuditTrails(responseDtoList);

		log.info("getSignatureCertificate: execution ended for envelopeId {}", envelopeId);

		try {
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

	@Override
	public ResponseEntityDto getCurrentUserNextEnvelopes(EnvelopeNextFilterDto envelopeNextFilterDto) {
		log.info("getCurrentUserNextEnvelopes: execution started");

		User currentUser = userService.getCurrentUser();
		if (currentUser == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		Page<EnvelopeNextData> envelopePage = envelopeDao.getCurrentUserEnvelopesByExpireDate(currentUser.getUserId(),
				envelopeNextFilterDto.getPage(), envelopeNextFilterDto.getSize());

		PageDto pageDto = new PageDto();
		pageDto.setItems(envelopePage.getContent());
		pageDto.setCurrentPage(envelopePage.getNumber());
		pageDto.setTotalItems(envelopePage.getTotalElements());
		pageDto.setTotalPages(envelopePage.getTotalPages());

		log.info("getCurrentUserNextEnvelopes: execution end");

		return new ResponseEntityDto(false, pageDto);
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

				if (!recipientRepository.findByEnvelopeIdAndAddressBookId(envelopeId, currentAddressBookUser.getId())
					.isEmpty()) {
					return;
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
		try {
			ClassPathResource resource = new ClassPathResource(
					"enterprise/templates/pdf/en/esignature/signature-certificate-v1.html");
			String template = new String(Files.readAllBytes(Paths.get(resource.getURI())), StandardCharsets.UTF_8);

			// Replace basic document information
			template = template.replace("{{documentName}}", EsignUtil.escapeHtml(responseDto.getName()));
			template = template.replace("{{documentUuid}}", EsignUtil.escapeHtml(responseDto.getUuid()));

			// Replace status information
			String statusClass = EsignUtil.getStatusClass(responseDto.getStatus());
			String statusLabel = EsignUtil.getStatusLabel(responseDto.getStatus());
			template = template.replace("{{statusClass}}", statusClass);
			template = template.replace("{{statusLabel}}", statusLabel);

			// Replace meta information
			template = template.replace("{{senderName}}", EsignUtil.escapeHtml(responseDto.getOwner().getName()));
			template = template.replace("{{enclosedDocuments}}",
					EsignUtil.escapeHtml(responseDto.getDocuments().getFirst().getName()));
			template = template.replace("{{dateCreated}}",
					formatDate(responseDto.getSentAt(), responseDto.getOrganizationTimeZone()));
			template = template.replace("{{timeZone}}",
					EsignUtil.escapeHtml(getTimeZoneWithOffset(responseDto.getOrganizationTimeZone())));

			// Replace recipients
			String recipients = responseDto.getRecipients()
				.stream()
				.map(recipient -> recipient.getAddressBook().getFirstName() + " "
						+ recipient.getAddressBook().getLastName())
				.collect(Collectors.joining(", "));
			template = template.replace("{{recipients}}", EsignUtil.escapeHtml(recipients));

			// Process audit trails
			template = processAuditTrails(template, responseDto);

			return template;

		}
		catch (IOException e) {
			log.error("Error loading signature certificate template", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_GENERATE_SIGNATURE_CERTIFICATE_PDF);
		}
	}

	private String processAuditTrails(String template, SignatureCertificateResponseDto responseDto) {
		String startMarker = "{{#auditTrails}}";
		String endMarker = "{{/auditTrails}}";

		int startIndex = template.indexOf(startMarker);
		int endIndex = template.indexOf(endMarker);

		if (startIndex == -1 || endIndex == -1) {
			return template;
		}

		String auditTemplate = template.substring(startIndex + startMarker.length(), endIndex);

		StringBuilder auditHtmlBuilder = new StringBuilder();
		if (responseDto.getAuditTrails() != null && !responseDto.getAuditTrails().isEmpty()) {
			for (AuditTrailResponseDto audit : responseDto.getAuditTrails()) {
				auditHtmlBuilder.append(
						auditTemplate
							.replace("{{timestamp}}",
									EsignUtil.escapeHtml(formatTimestamp(audit.getTimestamp(),
											responseDto.getOrganizationTimeZone())))
							.replace("{{userEmail}}", EsignUtil.escapeHtml(audit.getActionDoneByEmail()))
							.replace("{{activity}}", EsignUtil.escapeHtml(EsignUtil.getFormattedActionText(audit))));
			}
		}

		return template.substring(0, startIndex) + auditHtmlBuilder + template.substring(endIndex + endMarker.length());
	}

	private String formatDate(LocalDateTime dateTimeUtc, String timeZone) {
		if (dateTimeUtc == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_DATE_TIME_CANNOT_BE_NULL);
		}

		ZoneId targetZone = ZoneId.of(timeZone);
		ZonedDateTime zonedDateTime = dateTimeUtc.atZone(ZoneOffset.UTC).withZoneSameInstant(targetZone);

		return DateTimeUtils.formatDateTimeEsignCert(zonedDateTime.toLocalDateTime());
	}

	private String formatTimestamp(Instant instant, String timeZone) {
		if (instant == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_DATE_TIME_CANNOT_BE_NULL);
		}
		ZoneId zoneId = ZoneId.of(timeZone);
		LocalDateTime localDateTime = LocalDateTime.ofInstant(instant, zoneId);
		return DateTimeUtils.formatDateTimeEsignCert(localDateTime);
	}

	private String getTimeZoneWithOffset(String timeZoneId) {
		ZoneId zone = ZoneId.of(timeZoneId);
		ZoneOffset offset = zone.getRules().getOffset(Instant.now());
		String offsetId = offset.getId().replace("Z", "+00:00");
		return "(" + "GMT" + offsetId + ") " + timeZoneId;
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
		if (addressBook.getMySignatureLink() != null) {
			addressBookBasicResponseDto.setMySignatureLink(HTTPS_PROTOCOL + cloudFrontDomain + "/"
					+ EsignUtil.removeEsignPrefix(addressBook.getMySignatureLink()));
		}
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
		if (addressBook.getMySignatureLink() != null) {
			addressBookBasicResponseDto.setMySignatureLink(HTTPS_PROTOCOL + cloudFrontDomain + "/"
					+ EsignUtil.removeEsignPrefix(addressBook.getMySignatureLink()));
		}

		envelopeInboxInfoResponseDto.setAddressBook(addressBookBasicResponseDto);

		AddressBookBasicResponseDto senderAddressBookResponseDto = eSignMapper
			.addressBookToAddressBookBasicResponseDto(senderAddressBook);

		senderAddressBookResponseDto.setMySignatureLink(null);

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
			DocumentVersion documentVersion = documentVersionDao
				.findFirstByVersionNumberAndDocumentIdOrderByIdDesc(currentVersion, document.getId())
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));

			DocumentDetailResponseDto dto = new DocumentDetailResponseDto();
			dto.setId(document.getId());
			dto.setName(document.getName());
			dto.setFilePath(HTTPS_PROTOCOL + cloudFrontDomain + "/"
					+ EsignUtil.removeBucketAndEsignPrefix(bucketName, documentVersion.getFilePath()));

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

		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				String tenantId = TenantContext.getCurrentTenant();
				scheduleService.unScheduleExpiration(envelopeId, tenantId, QuartzEntityType.ENVELOPE);
			}
		});

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
		DocumentVersion firstVersion = documentVersionDao.findByVersionNumberAndDocumentId(1, document.getId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));

		// Update version 1 to -1
		firstVersion.setVersionNumber(-1);
		documentVersionDao.save(firstVersion);

		processDocumentCustodyTransfer(firstVersion, newOwner, 1);

		if (status != EnvelopeStatus.WAITING && status != EnvelopeStatus.DECLINED && status != EnvelopeStatus.VOIDED) {
			int currentVersionNumber = document.getCurrentVersion();

			if (currentVersionNumber > 1) {
				DocumentVersion currentVersion = documentVersionDao
					.findByVersionNumberAndDocumentId(currentVersionNumber, document.getId())
					.orElseThrow(
							() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));

				if (!Objects.equals(currentVersion.getId(), firstVersion.getId())) {
					// Update last completed version to -2
					currentVersion.setVersionNumber(-2);
					documentVersionDao.save(currentVersion);
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

		documentVersionDao.save(newVersion);

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
		recipient.setDeclineReason(declineEnvelopeRequestDto.getDeclineReason());

		envelope.getRecipients().forEach(recipientData -> {
			if (recipientData.getId().equals(recipient.getId())) {
				recipientData.setStatus(RecipientStatus.DECLINED);
			}

			if (envelope.getSignType().equals(SignType.PARALLEL)
					&& recipientData.getStatus().equals(RecipientStatus.NEED_TO_SIGN)) {
				recipientData.setStatus(RecipientStatus.EMPTY);
			}

			if (SignType.PARALLEL.equals(envelope.getSignType()) || (envelope.getSignType().equals(SignType.SEQUENTIAL)
					&& !recipientData.getStatus().equals(RecipientStatus.EMPTY))) {
				recipientData.setInboxStatus(InboxStatus.DECLINED);
			}
		});

		envelope.setStatus(EnvelopeStatus.DECLINED);
		envelopeDao.save(envelope);
		recipientService.sendEmailWhenDocumentIsVoidedOrDeclined(envelope.getId());

		AuditTrail auditTrail = auditTrailService.processAuditTrailInfo(envelope, recipient,
				AuditAction.ENVELOPE_DECLINED, null, ipAddress, null);
		auditTrailDao.save(auditTrail);

		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				String tenantId = TenantContext.getCurrentTenant();
				scheduleService.unScheduleExpiration(envelope.getId(), tenantId, QuartzEntityType.ENVELOPE);
			}
		});

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
