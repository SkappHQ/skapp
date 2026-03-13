package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.enterprise.esignature.payload.response.DocumentHashRepairResponseDto;
import com.skapp.enterprise.esignature.service.EsMigrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/ep/esign/migration")
@Tag(name = "ESign Migration", description = "Maintenance endpoints for eSign data repair (requires Client API Key)")
public class EsignMigrationController {

	private final EsMigrationService esMigrationService;

	@Operation(summary = "Repair document hashes and signatures",
			description = "Scans completed envelopes since 2026-01-01 for the given tenant, downloads each "
					+ "document's current version from S3, recomputes the SHA3-256 hash and ECDSA signature, "
					+ "and updates any mismatches in the database. Authenticate with 'x-api-key' header.",
			security = @SecurityRequirement(name = "ClientApiKey"))
	@PostMapping(value = "/repair-document-hashes", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<DocumentHashRepairResponseDto> repairDocumentHashes(@Parameter(
			description = "Tenant ID (schema name) to repair", required = true) @RequestParam String tenantId) {

		DocumentHashRepairResponseDto response = esMigrationService.repairDocumentHashes(tenantId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
