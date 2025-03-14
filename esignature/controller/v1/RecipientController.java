package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.service.RecipientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/esign/recipients")
public class RecipientController {

	private final RecipientService recipientService;

	@Operation(summary = "Find and send the email to the next recipient based on the defined signing order.",
			description = "This endpoint finds and send the email to the next available recipients up until the next Signer Role, in the defined signing order.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ESIGN_ADMIN','ROLE_ESIGN_SENDER')")
	@GetMapping(value = "/next-recipient", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> retrieveNextDocumentRecipientAndSendEmail(@RequestParam Long recipientId,
			@RequestParam Long envelopeId) {

		ResponseEntityDto response = recipientService.sendEmailToRecipient(recipientId, envelopeId);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Mock API to Demo Cancel Scheduled Emails Upon Completing the Document",
			description = "This endpoint is a mock API to Demo Cancel Scheduled Emails Upon Completing the Document.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ESIGN_ADMIN','ROLE_ESIGN_SENDER')")
	@PatchMapping(value = "/{id}/{envelopeId}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateRecipientStatus(
			@PathVariable @Schema(description = "ID of the recipient to update", example = "1") Long id,
			@PathVariable @Schema(description = "ID of the envelope to update", example = "1") Long envelopeId) {

		ResponseEntityDto response = recipientService.cancelEmailReminders(id, envelopeId);

		return new ResponseEntity<>(response, HttpStatus.OK);

	}

	@Operation(summary = "Mock API to Demo Email Sending when Document is Voided or Declined.",
			description = "This endpoint is a mock API to Demo Email Sending when Document is Voided or Declined.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ESIGN_ADMIN','ROLE_ESIGN_SENDER')")
	@GetMapping(value = "/void", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> sendEmailUpdate(@RequestParam Long envelopeId) {

		ResponseEntityDto response = recipientService.sendEmailWhenDocumentIsVoidedOrDeclined(envelopeId);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
