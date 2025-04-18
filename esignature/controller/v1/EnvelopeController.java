package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeDetailDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeInboxFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeSentFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeUpdateDto;
import com.skapp.enterprise.esignature.service.EnvelopeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/esign/envelopes")
public class EnvelopeController {

	private final EnvelopeService envelopeService;

	@Operation(summary = "Create a new envelope",
			description = "This endpoint creates a new envelope with the provided details.")
	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> createNewEnvelope(
			@Valid @RequestBody EnvelopeDetailDto envelopeDetailDto) {
		ResponseEntityDto response = envelopeService.createNewEnvelope(envelopeDetailDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Update an envelope", description = "This endpoint updates an existing envelope by it's ID.")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> updateEnvelope(
			@PathVariable @Schema(description = "ID of the employee to update", example = "1") Long id,
			@Valid @RequestBody EnvelopeUpdateDto envelopeUpdateDto) {
		ResponseEntityDto response = envelopeService.updateEnvelope(id, envelopeUpdateDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Employee Need To Sign KPI Values",
			description = "This endpoint returns the count of envelopes that need to be signed by a specific employee.")
	@GetMapping(value = "need-to-sign/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getEmployeeNeedToSignEnvelopeCount(
			@PathVariable @Schema(description = "ID of the employee to get count") Long id) {
		ResponseEntityDto response = envelopeService.getEmployeeNeedToSignEnvelopeCount(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get paginated envelopes received to current user",
			description = "Returns a paginated list of envelopes received to current user(inbox), including subject, "
					+ "sender email, status, expiry date, and received date. Supports filtering by envelope status, "
					+ "searching by subject or sender email, and sorting by expire and received dates.")
	@GetMapping(value = "/inbox/me", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getAllUserEnvelopes(@Valid EnvelopeInboxFilterDto envelopeInboxFilterDto) {
		ResponseEntityDto response = envelopeService.getAllUserEnvelopes(envelopeInboxFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get paginated list of sent envelopes",
			description = "Returns a paginated list of envelopes sent by the current user or by all users")
	@GetMapping(value = "/sent/me", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> getAllSentEnvelopes(@Valid EnvelopeSentFilterDto envelopeSentFilterDto) {
		ResponseEntityDto response = envelopeService.getAllSentEnvelopes(envelopeSentFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Sender's Basic KPI Values",
			description = "Returns the count of envelopes sent by the sender that are either completed or waiting to be signed.")
	@GetMapping(value = "sender/basic/analytics", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getSenderKPI() {
		ResponseEntityDto response = envelopeService.getSenderKPI();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
