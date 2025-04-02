package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
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
import java.util.Set;

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

		boolean isAuthorized = false;

		if (recipient == null) {
			User currentUser = userService.getCurrentUser();
			auditTrail.setActionUser(currentUser);

			Role esignRole = currentUser.getEmployee().getEmployeeRole().getEsignRole();
			isAuthorized = Set.of(Role.ESIGN_ADMIN, Role.SUPER_ADMIN).contains(esignRole);
		}
		else if (recipient.getEnvelope().equals(envelope)) {
			isAuthorized = true;
		}

		auditTrail.setIsAuthorized(isAuthorized);

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

		log.info("Envelope audit trail validation result for envelopeId {}: {}", envelopeId,
				allValid ? "All Valid" : "Some Tampered");

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

		List<AuditTrailResponseDto> responseDtoList = new ArrayList<>();

		for (AuditTrail auditTrail : auditTrails) {
			log.debug("Processing audit trail with ID: {}", auditTrail.getId());

			AuditTrailResponseDto responseDto = new AuditTrailResponseDto();

			responseDto.setAction(auditTrail.getAction());

			if (auditTrail.getRecipient() == null) {
				String actionDoneByName = auditTrail.getActionUser().getEmployee().getFirstName() + " "
						+ auditTrail.getActionUser().getEmployee().getLastName();
				responseDto.setActionDoneByName(actionDoneByName);
				log.debug("Action done by: {}", actionDoneByName);
			}
			else {
				responseDto.setActionDoneByName(auditTrail.getRecipient().getName());
				log.debug("Action done by recipient: {}", auditTrail.getRecipient().getName());
			}

			responseDto.setTimestamp(auditTrail.getTimestamp().toString());

			responseDtoList.add(responseDto);
		}

		log.info("Successfully fetched {} audit trails for envelopeId: {}", responseDtoList.size(), envelopeId);

		return new ResponseEntityDto(false, responseDtoList);
	}

	private String generateHashToValidate(AuditTrail auditTrail) {
		String rawData = auditTrail.getEnvelope().getId()
				+ (auditTrail.getRecipient() != null ? auditTrail.getRecipient().getId().toString() : "")
				+ (auditTrail.getActionUser() != null ? auditTrail.getActionUser().getUserId().toString() : "")
				+ auditTrail.getIpAddress() + auditTrail.getAction().name() + auditTrail.getIsAuthorized()
				+ auditTrail.getTimestamp().truncatedTo(ChronoUnit.MICROS).toString() + auditTrail.getMetadata().trim();

		return HashUtil.generateSHA256Hash(rawData);
	}

}
