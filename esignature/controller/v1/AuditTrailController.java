package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.AuditTrailDTO;
import com.skapp.enterprise.esignature.service.AuditTrailService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/esign/audit-trial")
public class AuditTrailController {

	private final AuditTrailService auditTrailService;

	@Operation(summary = "Create an audit trail record",
			description = "This endpoint logs an audit trail event for e-signature activities.")
	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER', 'ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> createAuditTrail(@Valid @RequestBody AuditTrailDTO auditTrailDTO) {
		ResponseEntityDto response = auditTrailService.createAuditTrail(auditTrailDTO);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

}
