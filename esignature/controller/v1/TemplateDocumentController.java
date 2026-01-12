package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.EditDocumentDto;
import com.skapp.enterprise.esignature.service.TemplateDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/esign/template/documents")
public class TemplateDocumentController {

	private final TemplateDocumentService templateDocumentService;

	@Operation(summary = "Upload Document Template",
			description = "This endpoint allows to add template document basic details to document table")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER')")
	@PostMapping()
	public ResponseEntity<ResponseEntityDto> saveDocument(@Valid @RequestBody DocumentDto documentDto) {

		ResponseEntityDto responseEntityDto = templateDocumentService.saveDocumentTemplate(documentDto);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.CREATED);
	}

	@Operation(summary = "Edit Document",
			description = "This endpoint allows editing the file path and name of a template document")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER')")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> editDocument(@PathVariable Long id,
			@Valid @RequestBody EditDocumentDto editDocumentDto) {
		ResponseEntityDto response = templateDocumentService.editDocumentTemplate(id, editDocumentDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete Document", description = "This endpoint allows deleting a template document by its ID")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER')")
	@DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> deleteDocument(@PathVariable Long id) {
		ResponseEntityDto response = templateDocumentService.deleteDocumentTemplate(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
