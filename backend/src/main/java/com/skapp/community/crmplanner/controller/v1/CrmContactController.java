package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactOwnerFilterDto;
import com.skapp.community.crmplanner.service.CrmContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/v1/contact")
@Tag(name = "CRM Contacts Controller", description = "Operations related to CRM Contacts")
public class CrmContactController {

	private final CrmContactService contactService;

	@Operation(summary = "Create CRM contact", description = "Creates a CRM contact and assigns an owner.")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	@PostMapping
	public ResponseEntity<ResponseEntityDto> createContact(@RequestBody CrmContactCreateRequestDto requestDto) {
		ResponseEntityDto response = contactService.createContact(requestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get CRM owners", description = "Retrieves active CRM users who can be assigned as owners.")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_MANAGER')")
	@GetMapping("/owners")
	public ResponseEntity<ResponseEntityDto> getOwners(CrmContactOwnerFilterDto filterDto) {
		ResponseEntityDto response = contactService.getContactOwners(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
