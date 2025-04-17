package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.DeclineEnvelopeRequestDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeDetailDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeUpdateDto;
import com.skapp.enterprise.esignature.payload.request.VoidEnvelopeRequestDto;
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

	@Operation(summary = "Void an envelope", description = "This endpoint voids an existing envelope by its ID.")
	@PatchMapping(value = "/void/{envelopeId}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ROLE_ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> voidEnvelope(
			@PathVariable @Schema(description = "ID of the envelope to void", example = "1") Long envelopeId,
			@Valid @RequestBody VoidEnvelopeRequestDto voidEnvelopeRequestDto) {
		ResponseEntityDto response = envelopeService.voidEnvelope(envelopeId, voidEnvelopeRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Decline an envelope",
			description = "This endpoint allows a recipient to decline an envelope.")
	@PatchMapping(value = "/decline/{recipientId}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> declineEnvelope(
			@PathVariable @Schema(description = "ID of the recipient", example = "1") Long recipientId,
			@Valid @RequestBody DeclineEnvelopeRequestDto declineEnvelopeRequestDto) {
		ResponseEntityDto response = envelopeService.declineEnvelope(recipientId, declineEnvelopeRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
