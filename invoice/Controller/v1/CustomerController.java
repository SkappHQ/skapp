package com.skapp.enterprise.invoice.Controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.CustomerCreateRequestDto;
import com.skapp.enterprise.invoice.service.CustomerService;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/invoice/customer")
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

}
