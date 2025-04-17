package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.EnvelopeSetting;
import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.DocumentSignDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeDetailDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeInboxFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeSentFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeUpdateDto;
import com.skapp.enterprise.esignature.payload.request.FieldDto;
import com.skapp.enterprise.esignature.payload.request.RecipientDto;
import com.skapp.enterprise.esignature.payload.response.DocumentDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.EmployeeKPIResponseDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeDetailedResponseDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeInfoResponseDto;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.DocumentDao;
import com.skapp.enterprise.esignature.repository.DocumentLinkRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionRepository;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.repository.projection.EnvelopeInboxData;
import com.skapp.enterprise.esignature.repository.projection.EnvelopeSentData;
import com.skapp.enterprise.esignature.service.DocumentService;
import com.skapp.enterprise.esignature.service.EnvelopeService;
import com.skapp.enterprise.esignature.service.RecipientService;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class EnvelopeServiceImpl implements EnvelopeService {

	private final EsignMapper eSignMapper;

	private final EnvelopeDao envelopeDao;

	private final UserService userService;

	private final DocumentDao documentDao;

	private final AddressBookDao addressBookDao;

	private final RecipientService recipientService;

	private final DocumentService documentService;

	private final DocumentVersionRepository documentVersionRepository;

	private final DocumentLinkRepository documentLinkRepository;

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

		List<DocumentVersion> documentVersionList = getDocumentsFirstVersion(envelopeDetailDto, envelope);

		documentVersionRepository.saveAll(documentVersionList);

		List<Document> updatedDocuments = documentVersionList.stream().map(documentVersion -> {
			Document document = documentVersion.getDocument();
			document.setCurrentVersion(documentVersion.getVersionNumber());
			document.setCurrentSignOderNumber(1);
			return document;
		}).toList();

		documentDao.saveAll(updatedDocuments);

		// Send Envelopes to recipient - async
		RecipientService.DocumentLinksAndRecipientsData documentLinksAndRecipientsData = recipientService
			.notifyDocumentFirstRecipients(savedEnvelope.getRecipients());

		List<Recipient> notifyRecipients = documentLinksAndRecipientsData.recipientList();

		List<DocumentLink> documentLinkList = documentLinksAndRecipientsData.documentLinkList();
		documentLinkRepository.saveAll(documentLinkList);

		Map<Long, Recipient> notifyMap = notifyRecipients.stream()
			.collect(Collectors.toMap(Recipient::getId, Function.identity()));

		for (Recipient recipient : savedEnvelope.getRecipients()) {
			Recipient updated = notifyMap.get(recipient.getId());
			if (updated != null) {
				recipient.setReminderBatchId(updated.getReminderBatchId());
				recipient.setReminderStatus(updated.getReminderStatus());
				recipient.setEmailStatus(updated.getEmailStatus());
			}
		}

		EnvelopeDetailedResponseDto responseDto = eSignMapper.envelopeToEnvelopeDetailedResponseDto(savedEnvelope);

		log.info("createNewEnvelope: execution end {}", currentUser.getUserId());
		return new ResponseEntityDto(false, responseDto);
	}

	private EnvelopeSetting getEnvelopeSetting(EnvelopeDetailDto envelopeDetailDto) {
		EnvelopeSetting envelopeSetting = new EnvelopeSetting();
		envelopeSetting.setExpirationDate(envelopeDetailDto.getEnvelopeSettingDto().getExpirationDate());
		envelopeSetting.setReminderDays(envelopeDetailDto.getEnvelopeSettingDto().getReminderDays());
		return envelopeSetting;
	}

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
			if (envelopeUpdateDto.getStatus() == EnvelopeStatus.CANCELED) {
				envelope.setStatus(EnvelopeStatus.CANCELED);
			}
			else if (envelopeUpdateDto.getStatus() == EnvelopeStatus.CREATED) {
				validateEnvelopeExpiration(envelope);
				envelope.setStatus(EnvelopeStatus.CREATED);
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
		envelope.setStatus(EnvelopeStatus.NEED_TO_SIGN);
		envelope.setMessage(dto.getMessage());
		envelope.setSubject(dto.getSubject());
		envelope.setExpireAt(dto.getExpireAt());
		envelope.setSentAt(LocalDateTime.now());
		return envelope;
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

			Recipient recipient = new Recipient();
			recipient.setAddressBook(addressBook);
			recipient.setMemberRole(recipientDto.getMemberRole());
			recipient.setStatus(recipientDto.getStatus());
			recipient.setSigningOrder(recipientDto.getSigningOrder());
			recipient.setColor(recipientDto.getColor());
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
		if (EnvelopeStatus.idVoidProhibitedFrom(envelope.getStatus())) {
			throw new ValidationException(EsignMessageConstant.ESIGN_ERROR_VOID_PROHIBITED_FROM_CURRENT_STATUS);
		}

		if (envelope.getStatus() == EnvelopeStatus.VOIDED) {
			throw new ValidationException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_ALREADY_VOIDED);
		}

		if (EnvelopeStatus.activeStatuses().contains(envelope.getStatus())) {
			envelope.setStatus(EnvelopeStatus.VOIDED);
			notifyVoid(envelope);
		}
	}

	private void notifyVoid(Envelope envelope) {
		// Notify all recipients that the envelope has been voided
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
				envelopeInboxData.setStatus(optionalRecipient.get().getStatus());
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

		if (!Objects.equals(currentUser.getUserId(), id)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		Optional<Envelope> envelopeOptional = envelopeDao.findById(id);
		if (envelopeOptional.isEmpty()) {
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		}
		Envelope envelope = envelopeOptional.get();

		EnvelopeInfoResponseDto envelopeInfoResponseDto = getEnvelopeInfoResponseDto(envelope);

		return new ResponseEntityDto(false, envelopeInfoResponseDto);
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

		if (addressBook == null || !addressBook.getInternalUser().getUserId().equals(currentUser.getUserId())) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		EnvelopeInfoResponseDto envelopeInfoResponseDto = getEnvelopeInfoResponseDto(envelope);

		return new ResponseEntityDto(false, envelopeInfoResponseDto);
	}

	private EnvelopeInfoResponseDto getEnvelopeInfoResponseDto(Envelope envelope) {
		EnvelopeInfoResponseDto envelopeInfoResponseDto = new EnvelopeInfoResponseDto();
		envelopeInfoResponseDto.setId(envelope.getId());
		envelopeInfoResponseDto.setSubject(envelope.getSubject());
		envelopeInfoResponseDto.setStatus(envelope.getStatus());

		List<Recipient> recipients = envelope.getRecipients();

		List<DocumentDetailResponseDto> documentDetails = getDocumentDetails(envelope);
		AddressBook addressBook = envelope.getOwner();

		envelopeInfoResponseDto.setDocuments(documentDetails);
		return envelopeInfoResponseDto;
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

	private List<DocumentVersion> getDocumentsFirstVersion(EnvelopeDetailDto envelopeDetailDto, Envelope envelope) {
		List<DocumentVersion> documentVersionList = new ArrayList<>();

		envelopeDetailDto.getDocumentIds().forEach(doc -> {
			DocumentSignDto documentSignDto = new DocumentSignDto();
			documentSignDto.setDocumentId(doc);
			documentSignDto.setEnvelopeId(envelope.getId());
			DocumentVersion documentVersion = documentService.signFirstVersionDocument(documentSignDto);
			documentVersionList.add(documentVersion);
		});
		return documentVersionList;
	}

}
