package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.AuditTrailDTO;

public interface AuditTrailService {

	ResponseEntityDto createAuditTrail(AuditTrailDTO auditTrailDTO);

}
