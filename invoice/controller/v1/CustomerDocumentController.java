package com.skapp.enterprise.invoice.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentFilterDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentRenameRequestDto;
import com.skapp.enterprise.invoice.service.CustomerDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/invoice/document")
public class CustomerDocumentController {

	private final CustomerDocumentService customerDocumentService;

	@Operation(summary = "Create customer document",
			description = "This endpoint allows creating a new customer document.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_INVOICE_ADMIN')")
	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> createDocument(
			@Valid @RequestBody CustomerDocumentCreateRequestDto requestDto) {
		ResponseEntityDto response = customerDocumentService.createDocument(requestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get document by ID", description = "This endpoint retrieves a customer document by its ID.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_INVOICE_ADMIN')")
	@GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getDocumentById(@PathVariable Long id) {
		ResponseEntityDto response = customerDocumentService.getDocumentById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Filter documents",
			description = "This endpoint allows filtering documents based on criteria.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_INVOICE_ADMIN')")
	@GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> filterDocuments(CustomerDocumentFilterDto filterDto) {
		ResponseEntityDto response = customerDocumentService.filterDocuments(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Download document", description = "This endpoint allows to download documents.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_INVOICE_ADMIN')")
	@GetMapping(value = "/download/{id}")
	public ResponseEntity<?> downloadDocument(@PathVariable Long id) {

		return customerDocumentService.downloadDocument(id);

	}

	@Operation(summary = "Rename document", description = "This endpoint allows to rename documents.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_INVOICE_ADMIN')")
	@PatchMapping(value = "/rename", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> renameDocument(
			@Valid @RequestBody CustomerDocumentRenameRequestDto customerDocumentRenameRequestDto) {
		ResponseEntityDto response = customerDocumentService.renameDocument(customerDocumentRenameRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete document", description = "This endpoint allows to delete documents.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_INVOICE_ADMIN')")
	@DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> deleteDocument(@PathVariable Long id) {
		ResponseEntityDto response = customerDocumentService.deleteDocument(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
