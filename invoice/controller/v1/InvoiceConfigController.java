package com.skapp.enterprise.invoice.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.InvoiceConfigRequestDto;
import com.skapp.enterprise.invoice.service.InvoiceConfigService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/invoice/config")
public class InvoiceConfigController {

	private final InvoiceConfigService invoiceConfigService;

	@Operation(summary = "Update global invoice configuration settings.",
			description = "This endpoint allows updating specific fields of the global invoice configuration")
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN')")
	@PatchMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateInvoiceConfig(@RequestBody InvoiceConfigRequestDto dto) {

		ResponseEntityDto updatedInvoiceConfig = invoiceConfigService.updateInvoiceConfig(dto);

		return new ResponseEntity<>(updatedInvoiceConfig, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve invoice global configuration settings.",
			description = "This endpoint retrieves the current invoice configuration settings")
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN')")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getInvoiceConfig() {

		ResponseEntityDto invoiceConfig = invoiceConfigService.getInvoiceConfig();

		return new ResponseEntity<>(invoiceConfig, HttpStatus.OK);
	}

}
