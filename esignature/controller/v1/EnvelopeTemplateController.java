package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.template.EnvelopeTemplateDto;
import com.skapp.enterprise.esignature.service.EnvelopeTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/esign/template/envelopes")
public class EnvelopeTemplateController {

	private final EnvelopeTemplateService envelopeTemplateService;

	@Operation(summary = "Create a new template for an envelope",
			description = "This endpoint creates a new envelope template with the provided details.")
	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> createNewEnvelopeTemplate(
			@Valid @RequestBody EnvelopeTemplateDto envelopeTemplateDto) {
		ResponseEntityDto response = envelopeTemplateService.createNewEnvelopeTemplate(envelopeTemplateDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Validate Envelope Template Name",
			description = "This endpoint returns if the envelope template name already exists or not.")
	@GetMapping(value = "/name-exists", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> searchTemplateNameExists(@RequestParam String name) {
		ResponseEntityDto response = envelopeTemplateService.searchTemplateNameExists(name);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
