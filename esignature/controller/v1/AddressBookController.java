package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.ExternalUserDto;
import com.skapp.enterprise.esignature.service.AddressBookService;
import com.skapp.enterprise.esignature.type.UserType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/esign/address-book")
public class AddressBookController {

	private final AddressBookService addressBookService;

	@PostMapping("/add-external-user")
	public ResponseEntity<ResponseEntityDto> addExternalUserToAddressBook(
			@Valid @RequestBody ExternalUserDto externalUser) {

		ResponseEntityDto response = addressBookService.addExternalUserToAddressBook(externalUser, UserType.EXTERNAL);

		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

}
