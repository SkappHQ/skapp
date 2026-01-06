package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.annotation.CaptureUserAgent;
import com.skapp.enterprise.esignature.payload.request.AuditTrailDto;
import com.skapp.enterprise.esignature.service.AuditTrailService;
import com.skapp.enterprise.esignature.util.EsignUtil;
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
@RequestMapping("/v1/ep/esign/audit-trail")
public class AuditTrailController {

	private final AuditTrailService auditTrailService;

	@Operation(summary = "Create an audit trail record",
			description = "This endpoint logs an audit trail event for e-signature activities.")
	@CaptureUserAgent
	@PostMapping("/create")
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS','ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> createAuditTrail(@Valid @RequestBody AuditTrailDto auditTrailDTO,
			HttpServletRequest request) {
		ResponseEntityDto response = auditTrailService.createAuditTrail(auditTrailDTO, EsignUtil.getClientIp(request),
				true);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Log Internal Audit Trail Event",
			description = "Creates an internal audit trail record for e-signature-related activities, capturing details such as action type, timestamp, and user IP.")
	@CaptureUserAgent
	@PostMapping("/internal/create")
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> createInternalAuditTrail(@Valid @RequestBody AuditTrailDto auditTrailDTO,
			HttpServletRequest request) {
		ResponseEntityDto response = auditTrailService.createAuditTrail(auditTrailDTO, EsignUtil.getClientIp(request),
				false);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Validate audit trail hash by audit ID",
			description = "Checks if the stored hash matches the recomputed hash for a specific audit trail entry.")
	@GetMapping("/validate/{auditTrailId}")
	@PreAuthorize("hasAnyRole('ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> validateAuditTrailHash(@PathVariable Long auditTrailId) {
		ResponseEntityDto response = auditTrailService.validateAuditTrailHash(auditTrailId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Validate all audit trail records for an envelope",
			description = "Checks integrity of all audit trail records for a given envelope.")
	@GetMapping("/envelope/validate/{envelopeId}")
	@PreAuthorize("hasAnyRole('ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> validateEnvelopeAuditTrails(@PathVariable Long envelopeId) {
		ResponseEntityDto response = auditTrailService.validateEnvelopeAuditTrails(envelopeId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get a list of audit trail records",
			description = "This endpoint fetches a list of audit trail events for a given envelope ID.")
	@GetMapping("/sent/envelope/{envelopeId}")
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getAuditTrails(@PathVariable Long envelopeId) {
		ResponseEntityDto response = auditTrailService.getAuditTrailsBySentEnvelope(envelopeId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get a list of audit trail records for inbox page",
			description = "This endpoint fetches a list of audit trail events for a given envelope ID.")
	@GetMapping("/inbox/envelope/{envelopeId}")
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getInboxAuditTrails(@PathVariable Long envelopeId) {
		ResponseEntityDto response = auditTrailService.getAuditTrailsByInboxEnvelope(envelopeId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
