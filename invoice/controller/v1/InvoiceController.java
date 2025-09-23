package com.skapp.enterprise.invoice.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.InvoiceStatusUpdateRequestDto;
import com.skapp.enterprise.invoice.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/invoice")
public class InvoiceController {

	private final InvoiceService invoiceService;

	@Operation(summary = "Create invoice.", description = "This endpoint allows to Create Invoice.")
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN' , 'ROLE_INVOICE_MANAGER')")
	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> createInvoice(
			@Valid @RequestBody CreateInvoiceRequestDto createInvoiceRequestDto) {

		ResponseEntityDto response = invoiceService.createInvoice(createInvoiceRequestDto);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve invoices with optional filtering.",
			description = "This endpoint retrieves paginated invoices list with optional filtering capabilities.")
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN' , 'ROLE_INVOICE_MANAGER')")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getFilteredInvoices(
			@Valid InvoiceFilterRequestDto invoiceFilterRequestDto) {

		ResponseEntityDto response = invoiceService.getFilteredInvoices(invoiceFilterRequestDto);

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

	@Operation(summary = "Retrieve invoices KPI Data for the current tenant/organization",
			description = "Provides the overdue and due count of invoices.")
	@GetMapping(value = "summary", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN' , 'ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getInvoiceKPI() {
		ResponseEntityDto response = invoiceService.getInvoiceKPI();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve invoices ID ", description = "Provides an System generated sequential invoice id")
	@GetMapping(value = "invoice-id", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN' , 'ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getInvoiceId(@RequestParam Long customerId) {
		ResponseEntityDto response = invoiceService.getInvoiceId(customerId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get invoice details by ID.",
			description = "This endpoint retrieves all the details of the invoice.")
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN','ROLE_INVOICE_MANAGER')")
	@GetMapping(value = "/{invoiceId}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getInvoiceById(@PathVariable Long invoiceId) {
		ResponseEntityDto response = invoiceService.getInvoiceById(invoiceId);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update the status of an invoice.",
			description = "This endpoint updates the status of an invoice.")
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN','ROLE_INVOICE_MANAGER')")
	@PatchMapping(value = "/status", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateInvoiceStatus(
			@Valid @RequestBody InvoiceStatusUpdateRequestDto invoiceStatusUpdateRequestDto) {
		ResponseEntityDto response = invoiceService.updateInvoiceStatus(invoiceStatusUpdateRequestDto);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Send a reminder email to the recipient.",
			description = "This endpoint sends a reminder email to the recipient.")
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN','ROLE_INVOICE_MANAGER')")
	@PostMapping(value = "/reminder", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> sendReminder(@RequestParam Long invoiceId) {

		ResponseEntityDto response = invoiceService.sendReminder(invoiceId);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
