package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.AddressBookFilterDto;
import com.skapp.enterprise.esignature.payload.request.ExternalUserDto;
import com.skapp.enterprise.esignature.service.AddressBookService;
import com.skapp.enterprise.esignature.service.ExternalUserService;
import com.skapp.enterprise.esignature.type.UserType;
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
@RequestMapping("/v1/ep/esign/address-book")
public class AddressBookController {

	private final AddressBookService addressBookService;

	private final ExternalUserService externalUserService;

	@Operation(summary = "Add External User",
			description = "This endpoint allows you to add an external user to both the address book and the external user table")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ESIGN_ADMIN','ROLE_ESIGN_SENDER')")
	@PostMapping("/add-external-user")
	public ResponseEntity<ResponseEntityDto> addExternalUserToAddressBook(
			@Valid @RequestBody ExternalUserDto externalUser) {

		ResponseEntityDto response = addressBookService.addExternalUserToAddressBook(externalUser, UserType.EXTERNAL);

		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Update External User",
			description = "This endpoint allows updating only specific fields of an external user.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ESIGN_ADMIN')")
	@PatchMapping("/edit-external-user/{id}")
	public ResponseEntity<ResponseEntityDto> editExternalUserinAddressBook(@PathVariable Long id,
			@Valid @RequestBody ExternalUserDto externalUserDto) {

		ResponseEntityDto response = externalUserService.editExternalUserinAddressBook(id, externalUserDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Soft Delete External User",
			description = "Marks an external user as DELETED and updates their email.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ESIGN_ADMIN')")
	@PatchMapping("/delete-external-user/{id}")
	public ResponseEntity<ResponseEntityDto> deleteExternalUser(@PathVariable Long id) {
		ResponseEntityDto response = externalUserService.deleteExternalUser(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "get all address book contacts",
			description = "This endpoint retrieves all address book contacts based on the provided filters, with support for pagination.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ESIGN_ADMIN','ROLE_ESIGN_SENDER')")
	@GetMapping
	public ResponseEntity<ResponseEntityDto> getAddressBookContacts(@Valid AddressBookFilterDto addressBookFilterDto) {

		ResponseEntityDto response = addressBookService.getAddressBookContacts(addressBookFilterDto);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "get recipients by search keyword",
			description = "This endpoint retrieves all address book contacts that match the provided keyword. "
					+ "The search results are prioritized based on email,firstname,lastname.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ESIGN_ADMIN','ROLE_ESIGN_SENDER')")
	@GetMapping(value = "/recipients/search", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> searchRecipientsByEmailPriority(@RequestParam String keyWord) {

		ResponseEntityDto response = addressBookService.fetchAddressBookContactsByEmailPriority(keyWord);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
