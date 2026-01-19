package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.template.EnvelopeTemplateCustodyTransferDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateEnvelopeDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateEnvelopeFilterDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateEnvelopeUpdateRequestDto;
import com.skapp.enterprise.esignature.service.TemplateEnvelopeService;
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
public class TemplateEnvelopeController {

	private final TemplateEnvelopeService templateEnvelopeService;

	@Operation(summary = "Create a new template for an envelope",
			description = "This endpoint creates a new envelope template with the provided details.")
	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> createNewEnvelopeTemplate(
			@Valid @RequestBody TemplateEnvelopeDto envelopeTemplateDto) {
		ResponseEntityDto response = templateEnvelopeService.createNewEnvelopeTemplate(envelopeTemplateDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Validate Envelope Template Name",
			description = "This endpoint returns if the envelope template name already exists or not.")
	@GetMapping(value = "/name-exists", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> searchTemplateNameExists(@RequestParam String name) {
		ResponseEntityDto response = templateEnvelopeService.searchTemplateNameExists(name);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve Envelope Templates",
			description = "This endpoint returns a list of the envelope templates in the paginated format.")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> getEnvelopeTemplates(
			@Valid TemplateEnvelopeFilterDto templateEnvelopeFilterDto) {
		ResponseEntityDto response = templateEnvelopeService.getEnvelopeTemplates(templateEnvelopeFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve Envelope Template by ID",
			description = "This endpoint returns an envelope template by ID.")
	@GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> getEnvelopeTemplateById(
			@PathVariable @Schema(description = "ID of the envelope template to retrieve", example = "1") Long id) {
		ResponseEntityDto response = templateEnvelopeService.getEnvelopeTemplateById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete Envelope Template",
			description = "This endpoint allows deleting an envelope template by its ID")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_SENDER')")
	@DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> deleteEnvelopeTemplate(@PathVariable Long id) {
		ResponseEntityDto response = templateEnvelopeService.deleteEnvelopeTemplate(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Custody Transfer of Envelope Template",
			description = "This endpoint updates the owner of an envelope Template (custody transfer) to a new owner.")
	@PatchMapping(value = "/custody-transfer/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> transferEnvelopeTemplateCustody(
			@PathVariable @Schema(description = "ID of the envelope template to transfer custody",
					example = "1") Long id,
			@Valid @RequestBody EnvelopeTemplateCustodyTransferDto envelopeTemplateCustodyTransferDto) {
		ResponseEntityDto response = templateEnvelopeService.transferEnvelopeTemplateCustody(id,
				envelopeTemplateCustodyTransferDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Edit Envelope Template",
			description = "This endpoint allows editing all details of an envelope template")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_SENDER')")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> editEnvelopeTemplate(@PathVariable Long id,
			@RequestBody TemplateEnvelopeUpdateRequestDto templateEnvelopeUpdateRequestDto) {
		ResponseEntityDto response = templateEnvelopeService.editEnvelopeTemplate(id, templateEnvelopeUpdateRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
