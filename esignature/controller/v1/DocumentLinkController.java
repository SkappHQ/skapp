package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.response.DocumentLinkResponseDto;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/esign/document-link")
public class DocumentLinkController {

	private final DocumentLinkService documentLinkService;

	@Operation(summary = "Create  sign or view document access link",
			description = "Generates a document access link which can view or sign for the given document Id and recipient Id")
	@PostMapping()
	@PreAuthorize("hasAnyRole('ROLE_ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> generateDocumentAccessUrl(
			@Valid @RequestBody DocumentAccessUrlDto documentAccessUrlDto) {

		DocumentLinkResponseDto documentLinkResponseDto = documentLinkService
			.generateDocumentAccessUrl(documentAccessUrlDto);

		return new ResponseEntity<>(new ResponseEntityDto(false, documentLinkResponseDto), HttpStatus.CREATED);
	}

	@Operation(summary = "Get data for sign or view link",
			description = "Fetches the sign or view related data for a given document and recipient using a document access token.")
	@PostMapping(value = "/access", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getRecipientDocumentData(@RequestParam Long documentId,
			@RequestParam Long recipientId) {

		ResponseEntityDto responseEntityDto = documentLinkService.getRecipientDocumentData(documentId, recipientId);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

}
