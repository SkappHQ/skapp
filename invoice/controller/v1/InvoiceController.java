package com.skapp.enterprise.invoice.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceRequestDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceSearchRequestDto;
import com.skapp.enterprise.invoice.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/invoice")
public class InvoiceController {

	private final InvoiceService invoiceService;

	@Operation(summary = "Create invoice.", description = "This endpoint allows to Create Invoice.")
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN' , 'ROLE_INVOICE_MANAGER')")
	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> createInvoice(
			@Valid @RequestBody CreateInvoiceRequestDto createInvoiceRequestDto) {

		ResponseEntityDto invoiceConfig = invoiceService.createInvoice(createInvoiceRequestDto);

		return new ResponseEntity<>(invoiceConfig, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve All invoices.",
			description = "This endpoint retrieves paginated invoices list of the organization.")
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN' , 'ROLE_INVOICE_MANAGER')")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getInvoices(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size, @RequestParam(defaultValue = "id") String sortBy,
			@RequestParam(defaultValue = "DESC") String sortDirection) {

		ResponseEntityDto invoiceConfig = invoiceService.getInvoices(page, size, sortBy, sortDirection);

		return new ResponseEntity<>(invoiceConfig, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve Filtered List of invoices.",
			description = "This endpoint retrieves Filtered paginated invoices list of the organization.")
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN' , 'ROLE_INVOICE_MANAGER')")
	@PostMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getFilteredInvoices(
			@Valid @RequestBody InvoiceFilterRequestDto invoiceFilterRequestDto) {

		ResponseEntityDto response = invoiceService.getFilteredInvoices(invoiceFilterRequestDto);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Search .", description = "This endpoint Search invoices by ???.")
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN' , 'ROLE_INVOICE_MANAGER')")
	@GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> searchInvoicesByName(
			@Valid InvoiceSearchRequestDto invoiceSearchRequestDto) {
		ResponseEntityDto response = invoiceService.searchInvoices(invoiceSearchRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve invoice tier limitations for the current tenant/organization",
			description = "Provides the remaining and allocated invoice limits for the organization, based on their subscription tier.")
	@GetMapping(value = "invoice-limitation", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN' , 'ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getInvoiceTierLimitations() {
		ResponseEntityDto response = invoiceService.getInvoiceTierLimitations();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve invoices Summary Data for the current tenant/organization",
			description = "Provides the paid and due count of invoices.")
	@GetMapping(value = "summary", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN' , 'ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getInvoicesSummary() {
		ResponseEntityDto response = invoiceService.getInvoicesSummary();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
