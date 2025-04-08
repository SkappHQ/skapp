package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.AuditTrailDto;

public interface AuditTrailService {

	ResponseEntityDto createAuditTrail(AuditTrailDto auditTrailDTO);

	ResponseEntityDto validateAuditTrailHash(Long auditTrailId);

	ResponseEntityDto validateEnvelopeAuditTrails(Long envelopeId);

	ResponseEntityDto getAuditTrailsByEnvelopeId(Long envelopeId);

}
