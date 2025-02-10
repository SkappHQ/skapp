package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.service.RecipientService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/esign/recipients")
public class RecipientController {

	private final RecipientService recipientService;

	@Operation(summary = "get next recipient based on the defined signing order",
			description = "This endpoint retrieves the next recipient details based on the defined signing order, when the sequential signing/receiving is enabled. "
					+ "Along with the envelope & document details to be include in the email subject & body. When recipientId is not provided, the very first recipients for "
					+ "the requested envelope id will be returned.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ESIGN_ADMIN','ROLE_ESIGN_SENDER')")
	@GetMapping(value = "/next-recipient", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> retrieveNextDocumentRecipientAndSendEmail(@RequestParam Long recipientId,
			@RequestParam Long envelopeId) {

		ResponseEntityDto response = recipientService.findNextRecipientAndSendEmail(Optional.ofNullable(recipientId),
				envelopeId);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
