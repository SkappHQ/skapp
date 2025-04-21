package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.DocumentFieldSignDto;
import com.skapp.enterprise.esignature.payload.request.DocumentSignDto;
import com.skapp.enterprise.esignature.payload.request.EditDocumentDto;
import com.skapp.enterprise.esignature.service.DocumentService;
import com.skapp.enterprise.esignature.type.SignType;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/esign/documents")
public class DocumentController {

	private final DocumentService documentService;

	@Operation(summary = "Upload Document",
			description = "This endpoint allows to add document basic details to document table")
	@PreAuthorize("hasAnyRole('ROLE_ESIGN_SENDER')")
	@PostMapping()
	public ResponseEntity<ResponseEntityDto> saveDocument(@Valid @RequestBody DocumentDto documentDto) {

		ResponseEntityDto responseEntityDto = documentService.saveDocument(documentDto);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.CREATED);
	}

	@Operation(summary = "Edit Document",
			description = "This endpoint allows editing the file path and name of a document")
	@PreAuthorize("hasAnyRole('ROLE_ESIGN_SENDER')")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> editDocument(@PathVariable Long id,
			@Valid @RequestBody EditDocumentDto editDocumentDto) {
		ResponseEntityDto response = documentService.editDocument(id, editDocumentDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete Document", description = "This endpoint allows deleting a document by its ID")
	@PreAuthorize("hasAnyRole('ROLE_ESIGN_SENDER')")
	@DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> deleteDocument(@PathVariable Long id) {
		ResponseEntityDto response = documentService.deleteDocument(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Sign Document",
			description = "This endpoint generates a digital signature corresponding to a specific document version, "
					+ "ensuring integrity and authenticity")
	@PostMapping(value = "/sign", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS','ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> signDocument(@Valid @RequestBody DocumentSignDto documentSignDto) {

		Document document = documentService.getDocumentById(documentSignDto.getDocumentId());

		ResponseEntityDto response;

		if (document.getEnvelope().getSignType().equals(SignType.SEQUENTIAL)) {
			response = documentService.sequentialSignDocument(documentSignDto);

		}
		else {
			response = documentService.parallelSignDocument(documentSignDto);
		}

		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Sign a field of a recipient ",
			description = "This endpoint generates a digital signature of a field corresponding to a recipient, "
					+ "ensuring integrity and authenticity")
	@PostMapping(value = "/sign-field", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS','ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> signField(@Valid @RequestBody DocumentFieldSignDto documentFieldSignDto) {
		ResponseEntityDto response = documentService.signField(documentFieldSignDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

}
