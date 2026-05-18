package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactOwnerFilterDto;
import com.skapp.community.crmplanner.service.CrmContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/crm")
@Tag(name = "CRM Contact Controller", description = "Endpoints for CRM contact management")
public class CrmContactController {

	private final CrmContactService crmContactService;

	@Operation(summary = "Create CRM contact", description = "Creates a CRM contact and assigns an owner.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE')")
	@PostMapping(value = "/contacts", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> createContact(
			@RequestBody CrmContactCreateRequestDto requestDto) {

		ResponseEntityDto response = crmContactService.createContact(requestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get CRM owners", description = "Retrieves active CRM users who can be assigned as owners.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER')")
	@GetMapping(value = "/owners", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getOwners(@Valid CrmContactOwnerFilterDto filterDto) {

		ResponseEntityDto response = crmContactService.getContactOwners(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
