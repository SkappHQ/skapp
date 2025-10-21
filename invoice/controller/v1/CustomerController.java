package com.skapp.enterprise.invoice.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.CustomerCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerFilterDto;
import com.skapp.enterprise.invoice.payload.request.CustomerStatusUpdateRequestDto;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerContactDetailsDto;
import com.skapp.enterprise.invoice.payload.request.customer.CheckEmailRequestDto;
import com.skapp.enterprise.invoice.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
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
@RequestMapping("/v1/ep/invoice/customer")
public class CustomerController {

	private final CustomerService customerService;

	@Operation(summary = "Create a new customer",
			description = "This endpoint creates a new customer with the provided billing and project details.")
	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> createNewCustomer(
			@Valid @RequestBody CustomerCreateRequestDto customerCreateRequestDto) {
		ResponseEntityDto response = customerService.createCustomer(customerCreateRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get paginated list of all customers", description = "Returns a paginated list of customers.")
	@GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN', 'ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getAllCustomers(@Valid CustomerFilterDto customerFilterDto) {
		ResponseEntityDto response = customerService.getAllCustomers(customerFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get customer by ID", description = "This endpoint fetches a customer by their ID.")
	@GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN', 'ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getCustomerById(@PathVariable Long id) {
		ResponseEntityDto response = customerService.getCustomerById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update a customer", description = "This endpoint updates an existing customer by their ID.")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN', 'ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> updateCustomer(
			@PathVariable @Schema(description = "ID of the customer to update", example = "1") Long id,
			@Valid @RequestBody CustomerCreateRequestDto customerCreateRequestDto) {
		ResponseEntityDto response = customerService.updateCustomer(id, customerCreateRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Change customer status", description = "Change customer status")
	@PatchMapping("/status/{id}")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> archiveCustomer(@PathVariable Long id,
			@Valid @RequestBody CustomerStatusUpdateRequestDto customerStatusUpdateRequestDto) {
		ResponseEntityDto response = customerService.updateCustomerStatus(id, customerStatusUpdateRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Create a new customer contact detail",
			description = "This endpoint creates a new customer contact.")
	@PostMapping(value = "/contact", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN', 'ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> createNewCustomerContact(
			@Valid @RequestBody CustomerContactDetailsDto customerContactDetailsDto) {
		ResponseEntityDto response = customerService.createCustomerContact(customerContactDetailsDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PostMapping(value = "/contact/check-email", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN', 'ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> checkCustomerContactEmail(
			@Valid @RequestBody CheckEmailRequestDto checkEmailRequestDto) {
		ResponseEntityDto response = customerService.checkCustomerContactEmail(checkEmailRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update a customer contact",
			description = "This endpoint updates an existing customer contact by their ID.")
	@PatchMapping(value = "/contact/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN', 'ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> updateCustomerContact(
			@PathVariable @Schema(description = "ID of the customer contact to update", example = "1") Long id,
			@Valid @RequestBody CustomerContactDetailsDto customerContactDetailsDto) {
		ResponseEntityDto response = customerService.updateCustomerContact(id, customerContactDetailsDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete a customer contact", description = "Delete a customer contact")
	@DeleteMapping("/contact/{id}")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN', 'ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> deleteCustomerContact(@PathVariable Long id) {
		ResponseEntityDto response = customerService.deleteCustomerContact(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
