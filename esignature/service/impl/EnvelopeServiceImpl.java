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
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.EnvelopeDetailDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeUpdateDto;
import com.skapp.enterprise.esignature.payload.request.FieldDto;
import com.skapp.enterprise.esignature.payload.request.RecipientDto;
import com.skapp.enterprise.esignature.payload.response.EmployeeKPIResponseDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeDetailedResponseDto;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.DocumentDao;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.service.EnvelopeService;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
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

	@Override
	@Transactional
	public ResponseEntityDto createNewEnvelope(EnvelopeDetailDto envelopeDetailDto) {
		log.info("createNewEnvelope: execution started");

		final Envelope envelope = eSignMapper.envelopeDetailDtoToEnvelope(envelopeDetailDto);

		Map<Long, Document> documentMap = processEnvelopeDocuments(envelopeDetailDto, envelope);
		processEnvelopeRecipients(envelopeDetailDto, envelope, documentMap);
		processEnvelopeSettings(envelopeDetailDto, envelope);

		updateEnvelopeMetadata(envelope);

		envelopeDao.save(envelope);

		// envelope status can be either created or draft
		if (envelope.getStatus() == EnvelopeStatus.CREATED) {
			shareEnvelope(envelope);
		}

		EnvelopeDetailedResponseDto responseDto = eSignMapper.envelopeToEnvelopeDetailedResponseDto(envelope);
		log.info("addNewEmployee: execution ended");
		return new ResponseEntityDto(false, responseDto);
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

	private void updateEnvelopeMetadata(final Envelope envelope) {
		envelope.setCreatedBy(userService.getCurrentUser().getEmail());
		envelope.setCreatedDate(LocalDateTime.now());
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

	private Map<Long, Document> processEnvelopeDocuments(EnvelopeDetailDto envelopeDetailDto, Envelope envelope) {
		List<Long> ids = envelopeDetailDto.getDocumentIds().stream().filter(Objects::nonNull).distinct().toList();

		if (ids.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_WITH_NO_DOCUMENT);
		}

		envelope.setDocuments(new ArrayList<>());
		Map<Long, Document> documentMap = documentDao.findAllById(ids)
			.stream()
			.collect(Collectors.toMap(Document::getId, document -> document));

		for (Long documentId : envelopeDetailDto.getDocumentIds()) {
			Document document = documentMap.getOrDefault(documentId, null);
			if (document == null) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ID_NOT_FOUND);
			}
			envelope.getDocuments().add(document);
			documentMap.put(documentId, document);
		}

		return documentMap;
	}

	private void processEnvelopeRecipients(EnvelopeDetailDto envelopeDetailDto, Envelope envelope,
			Map<Long, Document> documentMap) {
		List<RecipientDto> recipientDtos = envelopeDetailDto.getRecipients();
		List<Recipient> recipients = new ArrayList<>();

		List<Long> addressBookIds = envelopeDetailDto.getRecipients()
			.stream()
			.map(RecipientDto::getAddressBookId)
			.toList();
		Map<Long, AddressBook> addressBookMap = addressBookDao.findAllById(addressBookIds)
			.stream()
			.collect(Collectors.toMap(AddressBook::getId, addressBook -> addressBook));

		for (RecipientDto recipientDto : recipientDtos) {
			Recipient recipient = eSignMapper.recipientDtoToRecipient(recipientDto);
			recipient.setEnvelope(envelope);

			AddressBook addressBook = addressBookMap.getOrDefault(recipientDto.getAddressBookId(), null);
			if (addressBook == null) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_SIGNER_ID_NOT_FOUND);
			}

			recipient.setName(addressBook.getName());
			recipient.setEmail(addressBook.getEmail());

			List<Field> fields = new ArrayList<>();

			for (FieldDto fieldDto : recipientDto.getFields()) {
				Field field = eSignMapper.fieldDtoToField(fieldDto);
				field.setRecipient(recipient);
				Document document = documentMap.getOrDefault(fieldDto.getDocumentId(), null);
				if (document == null) {
					throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_DOCUMENT_ID_NOT_FOUND);
				}
				field.setDocument(document);
				fields.add(field);
			}
			recipient.setFields(fields);
			recipients.add(recipient);
		}
		envelope.setRecipients(recipients);
	}

	private void processEnvelopeSettings(EnvelopeDetailDto envelopeDetailDto, Envelope envelope) {

	}

	private void shareEnvelope(Envelope envelope) {

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

}
