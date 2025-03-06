package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.EnvelopeSetting;
import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.DocumentSignDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeDetailDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeUpdateDto;
import com.skapp.enterprise.esignature.payload.request.FieldDto;
import com.skapp.enterprise.esignature.payload.request.RecipientDto;
import com.skapp.enterprise.esignature.payload.response.EmployeeKPIResponseDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeDetailedResponseDto;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.DocumentDao;
import com.skapp.enterprise.esignature.repository.DocumentVersionRepository;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.service.DocumentService;
import com.skapp.enterprise.esignature.service.EnvelopeService;
import com.skapp.enterprise.esignature.service.RecipientService;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

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

	@Override
	@Transactional
	public ResponseEntityDto createNewEnvelope(@Valid EnvelopeDetailDto envelopeDetailDto) {
		log.info("createNewEnvelope: execution started {}", userService.getCurrentUser().getUserId());

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

		List<Recipient> recipients = buildRecipientsForEnvelope(envelopeDetailDto.getRecipients(), envelope);
		envelope.setRecipients(recipients);
		// setup envelop settings
		EnvelopeSetting envelopeSetting = getEnvelopeSetting(envelopeDetailDto);
		envelopeSetting.setEnvelope(envelope);

		envelope.setSetting(envelopeSetting);

		Envelope savedEnvelope = envelopeDao.save(envelope);

		List<DocumentVersion> documentVersionList = getDocumentsFirstVersion(envelopeDetailDto, envelope);

		documentVersionRepository.saveAll(documentVersionList);

		List<Document> updatedDocuments = documentVersionList.stream().map(documentVersion -> {
			Document document = documentVersion.getDocument();
			document.setCurrentVersion(documentVersion.getVersionNumber());
			return document;
		}).toList();

		documentDao.saveAll(updatedDocuments);

		// Send Envelopes to recipient - async
		ResponseEntityDto emailResponse = recipientService.sendEmailToRecipient(null, savedEnvelope.getId());

		EnvelopeDetailedResponseDto responseDto = eSignMapper.envelopeToEnvelopeDetailedResponseDto(savedEnvelope);
		responseDto.setEmailResponse(emailResponse.getResults());

		log.info("createNewEnvelope: execution end {}", userService.getCurrentUser().getUserId());
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

			Recipient recipient = new Recipient();
			recipient.setAddressBook(addressBook);
			recipient.setMemberRole(recipientDto.getMemberRole());
			recipient.setStatus(recipientDto.getStatus());
			recipient.setSigningOrder(recipientDto.getSigningOrder());
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
