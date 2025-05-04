package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.AuditTrailDto;
import jakarta.servlet.http.HttpServletRequest;

public interface AuditTrailService {

	ResponseEntityDto createAuditTrail(AuditTrailDto auditTrailDTO, HttpServletRequest request);

	ResponseEntityDto validateAuditTrailHash(Long auditTrailId);

	ResponseEntityDto validateEnvelopeAuditTrails(Long envelopeId);

	ResponseEntityDto getAuditTrailsByEnvelopeId(Long envelopeId);

}
