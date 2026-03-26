package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.enterprise.esignature.payload.response.RepairJobDto;
import com.skapp.enterprise.esignature.service.EsMigrationService;
import com.skapp.enterprise.esignature.service.impl.RepairJobTracker;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/ep/esign/migration")
@Tag(name = "ESign Migration", description = "Maintenance endpoints for eSign data repair (requires Client API Key)")
public class EsignMigrationController {

	private final EsMigrationService esMigrationService;

	private final RepairJobTracker repairJobTracker;

	// -------------------------------------------------------------------------
	// Internal Use Only API
	// -------------------------------------------------------------------------

	@Operation(summary = "Start async document hash repair",
			description = "Kicks off an asynchronous repair job that scans completed envelopes for the "
					+ "given tenant, downloads each document's current version from S3, recomputes the "
					+ "SHA3-256 hash and ECDSA signature, and updates any mismatches in the database. "
					+ "Returns immediately with a job ID that can be polled via the status endpoint. "
					+ "Authenticate with 'x-api-key' header.",
			security = @SecurityRequirement(name = "ClientApiKey"))
	@PostMapping(value = "/repair-document-hashes", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<RepairJobDto> repairDocumentHashes(@Parameter(
			description = "Only process envelopes completed on or after this date (ISO format: yyyy-MM-dd)") @RequestParam @DateTimeFormat(
					iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {

		RepairJobDto job = repairJobTracker.createJob();
		esMigrationService.repairDocumentHashesAsync(startDate, job.getJobId());
		return new ResponseEntity<>(job, HttpStatus.ACCEPTED);
	}

	@Operation(summary = "Poll repair job status",
			description = "Returns the current status and results (if completed) of a previously started "
					+ "repair job. The migration service should poll this endpoint every 5–10 seconds until "
					+ "the status is COMPLETED or FAILED before moving to the next tenant.",
			security = @SecurityRequirement(name = "ClientApiKey"))
	@GetMapping(value = "/repair-document-hashes/status", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<RepairJobDto> getRepairJobStatus(@Parameter(
			description = "The job ID returned by the repair initiation endpoint") @RequestParam String jobId) {

		RepairJobDto job = repairJobTracker.getJob(jobId);
		if (job == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		return new ResponseEntity<>(job, HttpStatus.OK);
	}

}
