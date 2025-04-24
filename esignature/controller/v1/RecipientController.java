package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.service.RecipientService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("v1/ep/esign/recipients")
public class RecipientController {

	private final RecipientService recipientService;

	@Operation(summary = "Send a reminder email to the recipient.",
			description = "This endpoint sends a reminder email to the recipient when the Nudge button is clicked.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ESIGN_ADMIN','ROLE_ESIGN_SENDER')")
	@PostMapping(value = "/nudge", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> sendNudgeEmail(@RequestParam Long recipientId) {

		ResponseEntityDto response = recipientService.sendNudgeEmail(recipientId);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update recipient consent for document signing",
			description = "This endpoint updates the recipient's consent status for signing a document")
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS','ESIGN_EMPLOYEE')")
	@PostMapping(value = "/consent", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateRecipientConsent(@RequestParam boolean isConsent) {

		ResponseEntityDto response = recipientService.updateRecipientConsent(isConsent);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
