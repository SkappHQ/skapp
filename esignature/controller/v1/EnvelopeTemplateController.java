package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.template.EnvelopeTemplateDto;
import com.skapp.enterprise.esignature.service.EnvelopeTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

}
