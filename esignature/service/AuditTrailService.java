package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.AuditTrail;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.AuditTrailDto;
import com.skapp.enterprise.esignature.type.AuditAction;
import tools.jackson.databind.JsonNode;

public interface AuditTrailService {

	ResponseEntityDto createAuditTrail(AuditTrailDto auditTrailDTO, String ipAddress, boolean isDocAccess);

	ResponseEntityDto validateAuditTrailHash(Long auditTrailId);

	ResponseEntityDto validateEnvelopeAuditTrails(Long envelopeId);

	ResponseEntityDto getAuditTrailsBySentEnvelope(Long envelopeId);

	ResponseEntityDto getAuditTrailsByInboxEnvelope(Long envelopeId);

	AuditTrail processAuditTrailInfo(Envelope envelope, Recipient recipient, AuditAction action,
			AddressBook addressBook, String ipAddress, JsonNode metadata);

}
