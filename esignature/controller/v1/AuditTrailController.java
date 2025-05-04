package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.AuditTrailDto;
import com.skapp.enterprise.esignature.service.AuditTrailService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> createAuditTrail(@Valid @RequestBody AuditTrailDto auditTrailDTO,
			HttpServletRequest request) {
		ResponseEntityDto response = auditTrailService.createAuditTrail(auditTrailDTO, request);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Validate audit trail hash by audit ID",
			description = "Checks if the stored hash matches the recomputed hash for a specific audit trail entry.")
	@GetMapping("/validate/{auditTrailId}")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER', 'ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> validateAuditTrailHash(@PathVariable Long auditTrailId) {
		ResponseEntityDto response = auditTrailService.validateAuditTrailHash(auditTrailId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Validate all audit trail records for an envelope",
			description = "Checks integrity of all audit trail records for a given envelope.")
	@GetMapping("/envelope/validate/{envelopeId}")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER', 'ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> validateEnvelopeAuditTrails(@PathVariable Long envelopeId) {
		ResponseEntityDto response = auditTrailService.validateEnvelopeAuditTrails(envelopeId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get a list of audit trail records",
			description = "This endpoint fetches a list of audit trail events for a given envelope ID.")
	@GetMapping("/envelope/{envelopeId}")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER', 'ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getAuditTrails(@PathVariable Long envelopeId) {
		ResponseEntityDto response = auditTrailService.getAuditTrailsByEnvelopeId(envelopeId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
