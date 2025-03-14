package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.TemporaryLink;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.DocumentFieldSignDto;
import com.skapp.enterprise.esignature.payload.request.DocumentSignDto;
import com.skapp.enterprise.esignature.payload.request.DocumentSigningLinkDto;
import com.skapp.enterprise.esignature.payload.request.TemporaryLinkResponseDto;
import com.skapp.enterprise.esignature.service.DocumentService;
import com.skapp.enterprise.esignature.service.TemporaryLinkService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/esign/documents")
public class DocumentController {

	private final DocumentService documentService;

	private final TemporaryLinkService temporaryLinkService;

	@Operation(summary = "Upload Document",
			description = "This endpoint allows to add document basic details to document table")
	@PreAuthorize("hasAnyRole('ROLE_ESIGN_SENDER')")
	@PostMapping()
	public ResponseEntity<ResponseEntityDto> saveDocument(@Valid @RequestBody DocumentDto documentDto) {

		ResponseEntityDto responseEntityDto = documentService.saveDocument(documentDto);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.CREATED);
	}

	@Operation(summary = "Sign Document",
			description = "This endpoint generates a digital signature corresponding to a specific document version, "
					+ "ensuring integrity and authenticity")
	@PostMapping(value = "/sign", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> signDocument(@Valid @RequestBody DocumentSignDto documentSignDto) {
		ResponseEntityDto response = documentService.sequentialSignDocument(documentSignDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Sign a field of a recipient ",
			description = "This endpoint generates a digital signature of a field corresponding to a recipient, "
					+ "ensuring integrity and authenticity")
	@PostMapping(value = "/sign-field", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> signField(@Valid @RequestBody DocumentFieldSignDto documentFieldSignDto) {
		ResponseEntityDto response = documentService.sequentialSignField(documentFieldSignDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PostMapping("/{documentId}/signing-link")
	@PreAuthorize("hasAuthority('DOCUMENT_MANAGE')")
	public ResponseEntity<TemporaryLinkResponseDto> createSigningLink(@PathVariable Long documentId,
			@RequestBody(required = false) DocumentSigningLinkDto request) {

		Integer expirationHours = request != null ? request.getExpirationHours() : null;
		Integer maxClicks = request != null ? request.getMaxClicks() : null;

		String token = temporaryLinkService.createTemporaryLink(documentId, expirationHours, maxClicks);

		TemporaryLinkResponseDto response = TemporaryLinkResponseDto.builder()
			.token(token)
			.url("/v1/ep/document/sign?token=" + token)
			.expirationHours(expirationHours != null ? expirationHours : 48)
			.maxClicks(maxClicks != null ? maxClicks : 5)
			.build();

		return ResponseEntity.ok(response);
	}

	@GetMapping("/{documentId}/signing-links")
	@PreAuthorize("hasAuthority('DOCUMENT_MANAGE')")
	public ResponseEntity<List<TemporaryLinkResponseDto>> getSigningLinks(@PathVariable Long documentId) {
		List<TemporaryLink> links = temporaryLinkService.getActiveLinksForDocument(documentId);

		List<TemporaryLinkResponseDto> response = links.stream()
			.map(link -> TemporaryLinkResponseDto.builder()
				.token(link.getToken())
				.url("/v1/ep/document/sign?token=" + link.getToken())
				.expirationHours(java.time.Duration.between(link.getCreatedAt(), link.getExpiresAt()).toHours())
				.maxClicks(link.getMaxClicks())
				.clickCount(link.getClickCount())
				.build())
			.collect(Collectors.toList());

		return ResponseEntity.ok(response);
	}

	@DeleteMapping("/{documentId}/signing-links")
	@PreAuthorize("hasAuthority('DOCUMENT_MANAGE')")
	public ResponseEntity<Void> deactivateAllSigningLinks(@PathVariable Long documentId) {
		temporaryLinkService.deactivateAllForDocument(documentId);
		return ResponseEntity.ok().build();
	}

}
