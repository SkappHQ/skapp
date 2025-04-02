package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.model.AuditTrail;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.AuditTrailDTO;
import com.skapp.enterprise.esignature.payload.response.AuditTrailResponseDto;
import com.skapp.enterprise.esignature.payload.response.AuditValidationResponseDto;
import com.skapp.enterprise.esignature.repository.AuditTrailDao;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.service.AuditTrailService;
import com.skapp.enterprise.esignature.utill.HashUtil;
import com.skapp.community.common.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
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

	private final OrganizationService organizationService;


	@Override
	public ResponseEntityDto createAuditTrail(AuditTrailDTO auditTrailDTO) {
		log.info("Creating audit trail for envelope: {}", auditTrailDTO.getEnvelopeId());

		Envelope envelope = envelopeDao.findById(auditTrailDTO.getEnvelopeId())
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND));

		Recipient recipient = Optional.ofNullable(auditTrailDTO.getRecipientId())
				.flatMap(recipientRepository::findById)
				.orElse(null);




		Instant timestamp = Instant.now().truncatedTo(ChronoUnit.MICROS);
		AuditTrail auditTrail = new AuditTrail();

		if (recipient == null) {
			auditTrail.setActionUser(userService.getCurrentUser());
		}

		auditTrail.setEnvelope(envelope);
		auditTrail.setRecipient(recipient);
		auditTrail.setIpAddress(auditTrailDTO.getIpAddress());
		auditTrail.setAction(auditTrailDTO.getAction());
		auditTrail.setMetadata(auditTrailDTO.getMetadata());
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
		log.info("hashindb ----"+auditTrail.getHash());
		log.info("datain db hashed"+generateHashToValidate(auditTrail));

		log.info("Audit trail validation result for auditTrailId {}: {}", auditTrailId, isValid ? "Valid" : "Tampered");

		return new ResponseEntityDto(false, new AuditValidationResponseDto(auditTrailId, isValid));
	}

	@Override
	public ResponseEntityDto validateEnvelopeAuditTrails(Long envelopeId) {
		log.info("Validating all audit trails for envelopeId: {}", envelopeId);

		List<AuditTrail> auditTrails = auditTrailDao.findByEnvelopeId(envelopeId);

		if (auditTrails.isEmpty()) {
			log.warn("No audit trails found for envelopeId: {}", envelopeId);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_AUDIT_TRAIL_NOT_FOUND);
		}

		boolean allValid = auditTrails.stream()
				.allMatch(auditTrail -> generateHashToValidate(auditTrail).equals(auditTrail.getHash()));

		log.info("Envelope audit trail validation result for envelopeId {}: {}", envelopeId, allValid ? "All Valid" : "Some Tampered");

		return new ResponseEntityDto(false, new AuditValidationResponseDto(envelopeId, allValid));
	}

	@Override
	public ResponseEntityDto getAuditTrailsByEnvelopeId(Long envelopeId) {
		log.info("Fetching audit trails for envelopeId: {}", envelopeId);

		List<AuditTrail> auditTrails = auditTrailDao.findByEnvelopeIdOrderByTimestampAsc(envelopeId);

		if (auditTrails.isEmpty()) {
			log.warn("No audit trails found for envelopeId: {}", envelopeId);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_AUDIT_TRAIL_NOT_FOUND);
		}

		// Fetch the organization time zone
		String organizationTimeZone = organizationService.getOrganizationTimeZone();


		List<AuditTrailResponseDto> responseDtoList = new ArrayList<>();

		for (AuditTrail auditTrail : auditTrails) {
			log.debug("Processing audit trail with ID: {}", auditTrail.getId());

			AuditTrailResponseDto responseDto = new AuditTrailResponseDto();

			// Set the action
			responseDto.setAction(auditTrail.getAction());

			// Set the actionDoneByName
			if (auditTrail.getRecipient() == null) {
				// If recipient is null, use actionUser's employee first name and last name
				String actionDoneByName = auditTrail.getActionUser().getEmployee().getFirstName() + " " + auditTrail.getActionUser().getEmployee().getLastName();
				responseDto.setActionDoneByName(actionDoneByName);
				log.debug("Action done by: {}", actionDoneByName);
			} else {
				// If recipient is not null, use recipient's name
				responseDto.setActionDoneByName(auditTrail.getRecipient().getName());
				log.debug("Action done by recipient: {}", auditTrail.getRecipient().getName());
			}

			// Convert the timestamp from UTC to organization time zone
			LocalDateTime convertedTimestamp = DateTimeUtils.convertUTCToTimeZone(
					auditTrail.getTimestamp().atZone(ZoneId.of("UTC")).toLocalDateTime(), organizationTimeZone);


			// Format the converted timestamp with the desired format and suffix
			String formattedTimestamp = DateTimeUtils.formatTimestampWithSuffix(convertedTimestamp);
			responseDto.setTimestamp(formattedTimestamp);  // Set the formatted timestamp


			// Add to the response list
			responseDtoList.add(responseDto);
		}

		log.info("Successfully fetched {} audit trails for envelopeId: {}", responseDtoList.size(), envelopeId);

		return new ResponseEntityDto(false, responseDtoList);
	}





	private String generateHashToValidate(AuditTrail auditTrail) {
		String rawData = auditTrail.getEnvelope().getId() +
				(auditTrail.getRecipient() != null ? auditTrail.getRecipient().getId().toString() : "") +
				(auditTrail.getActionUser() != null ? auditTrail.getActionUser().getUserId().toString():"") +
				auditTrail.getIpAddress() +
				auditTrail.getAction().name() +
				auditTrail.getTimestamp().truncatedTo(ChronoUnit.MICROS).toString() +
				auditTrail.getMetadata().trim();

		return HashUtil.generateSHA256Hash(rawData);
	}

}
