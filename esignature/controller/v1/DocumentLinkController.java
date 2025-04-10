package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.response.TemporaryLinkResponseDto;
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

	@Operation(summary = "Create temporary signing link",
			description = "Generates a temporary signing link for the given envelope Id and recipient Id")
	@PostMapping()
	@PreAuthorize("hasAnyRole('ROLE_ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> generateDocumentAccessUrl(
			@Valid @RequestBody DocumentAccessUrlDto documentAccessUrlDto) {

		TemporaryLinkResponseDto temporaryLinkResponseDto = documentLinkService
			.generateDocumentAccessUrl(documentAccessUrlDto);

		return new ResponseEntity<>(new ResponseEntityDto(false, temporaryLinkResponseDto), HttpStatus.CREATED);
	}

	@Operation(summary = "Get data for signing link",
			description = "Fetches the signing-related data for a given envelope and recipient using a temporary access token.")
	@PostMapping(value = "/access", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getRecipientDocumentData(@RequestParam Long documentId,
			@RequestParam Long recipientId) {

		ResponseEntityDto responseEntityDto = documentLinkService.getRecipientDocumentData(documentId, recipientId);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

}
