package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

}
