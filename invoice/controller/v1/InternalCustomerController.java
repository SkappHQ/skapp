package com.skapp.enterprise.invoice.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.CustomerCreateRequestDto;
import com.skapp.enterprise.invoice.payload.response.InternalCustomerResponseDto;
import com.skapp.enterprise.invoice.service.CustomerService;
import com.skapp.enterprise.invoice.service.InternalCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/ep/invoice/customer")
public class InternalCustomerController {

	private final InternalCustomerService internalCustomerService;

	private final CustomerService customerService;

	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<List<InternalCustomerResponseDto>> getAllCustomers() {

		List<InternalCustomerResponseDto> response = internalCustomerService.findAllCustomers();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<ResponseEntityDto> createCustomer(
			@RequestBody CustomerCreateRequestDto customerCreateRequestDto) {

		ResponseEntityDto response = customerService.createCustomer(customerCreateRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

}
