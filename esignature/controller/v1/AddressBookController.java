package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.AddressBookFilterDto;
import com.skapp.enterprise.esignature.payload.request.ExternalUserDto;
import com.skapp.enterprise.esignature.service.AddressBookService;
import com.skapp.enterprise.esignature.type.UserType;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/esign/address-book")
public class AddressBookController {

	private final AddressBookService addressBookService;

	@Operation(summary = "Add External User",
			description = "This endpoint allows you to add an external user to both the address book and the external user table")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ESIGN_ADMIN','ROLE_ESIGN_SENDER')")
	@PostMapping("/add-external-user")
	public ResponseEntity<ResponseEntityDto> addExternalUserToAddressBook(
			@Valid @RequestBody ExternalUserDto externalUser) {

		ResponseEntityDto response = addressBookService.addExternalUserToAddressBook(externalUser, UserType.EXTERNAL);

		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "get all address book contacts",
			description = "This endpoint retrieves all address book contacts based on the provided filters, with support for pagination.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ESIGN_ADMIN','ROLE_ESIGN_SENDER')")
	@GetMapping
	public ResponseEntity<ResponseEntityDto> getAddressBookContacts(@Valid AddressBookFilterDto addressBookFilterDto) {

		ResponseEntityDto response = addressBookService.getAddressBookContacts(addressBookFilterDto);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
