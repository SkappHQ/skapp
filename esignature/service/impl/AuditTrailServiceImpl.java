package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.model.AuditTrail;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.AuditTrailDTO;
import com.skapp.enterprise.esignature.repository.AuditTrailDao;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.service.AuditTrailService;
import com.skapp.enterprise.esignature.utill.HashUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditTrailServiceImpl implements AuditTrailService {

	private final AuditTrailDao auditTrailDao;

	private final EnvelopeDao envelopeDao;

	private final RecipientRepository recipientRepository;

	@Override
	public ResponseEntityDto createAuditTrail(AuditTrailDTO auditTrailDTO) {
		log.info("Creating audit trail for envelope: {}", auditTrailDTO.getEnvelopeId());

		AuditTrail auditTrail = new AuditTrail();
		auditTrail.setIpAddress(auditTrailDTO.getIpAddress());
		auditTrail.setAction(auditTrailDTO.getAction());
		auditTrail.setMetadata(auditTrailDTO.getMetadata());
		auditTrail.setTimestamp(Instant.now());

		Envelope envelope = envelopeDao.findById(auditTrailDTO.getEnvelopeId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND));
		auditTrail.setEnvelope(envelope);

		if (auditTrailDTO.getRecipientId() != null) {
			Recipient recipient = recipientRepository.findById(auditTrailDTO.getRecipientId())
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_NO_RECIPIENT_FOUND));
			auditTrail.setRecipient(recipient);
		}

		// Generate hash for integrity
		auditTrail.setHash(generateHash(auditTrailDTO, auditTrail.getTimestamp()));

		auditTrailDao.save(auditTrail);
		log.info("Audit trail saved successfully for envelope: {}", auditTrailDTO.getEnvelopeId());

		return new ResponseEntityDto("Audit trail created successfully", false);
	}

	private String generateHash(AuditTrailDTO auditTrailDTO, Instant timestamp) {
		String rawData = String.valueOf(auditTrailDTO.getEnvelopeId())
				+ (auditTrailDTO.getRecipientId() != null ? String.valueOf(auditTrailDTO.getRecipientId()) : "")
				+ auditTrailDTO.getIpAddress() + auditTrailDTO.getAction().name() + timestamp.toString()
				+ auditTrailDTO.getMetadata();

		return HashUtil.generateSHA256Hash(rawData);
	}

}
