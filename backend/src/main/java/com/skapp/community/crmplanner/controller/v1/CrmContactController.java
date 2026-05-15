package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.*;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
			@Valid @RequestBody CrmContactCreateRequestDto requestDto) {

		ResponseEntityDto response = crmContactService.createContact(requestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get CRM contacts",
			description = "Retrieves a paginated, searchable and filterable list of CRM contacts.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE')")
	@GetMapping(value = "/contacts", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getContacts(@Valid CrmContactFilterDto filterDto) {

		ResponseEntityDto response = crmContactService.getContacts(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get CRM contact by ID",
			description = "Retrieves detailed information for a specific CRM contact.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE')")
	@GetMapping(value = "/contacts/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getContactById(@PathVariable Long id) {

		ResponseEntityDto response = crmContactService.getContactById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get CRM contact metrics",
			description = "Retrieves key metrics for a specific CRM contact including revenue, deals, and tasks.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE')")
	@GetMapping(value = "/contacts/{id}/metrics", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getContactMetrics(@PathVariable Long id) {

		ResponseEntityDto response = crmContactService.getContactMetrics(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get deals for contact",
			description = "Retrieves all deals linked to a specific contact.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE')")
	@GetMapping(value = "/contacts/{contactId}/deals", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getContactDeals(@PathVariable Long contactId) {

		ResponseEntityDto response = crmContactService.getContactDeals(contactId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Create task for contact", description = "Creates a new task linked to a contact.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE')")
	@PostMapping(value = "/contacts/{contactId}/tasks", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> createContactTask(@PathVariable Long contactId,
			@Valid @RequestBody CrmTaskCreateRequestDto requestDto) {

		ResponseEntityDto response = crmContactService.createContactTask(contactId, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Create deal for contact", description = "Creates a new deal linked to a contact.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE')")
	@PostMapping(value = "/contacts/{contactId}/deals", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> createContactDeal(@PathVariable Long contactId,
			@Valid @RequestBody CrmDealCreateRequestDto requestDto) {

		ResponseEntityDto response = crmContactService.createContactDeal(contactId, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get tasks for contact",
			description = "Retrieves all tasks linked to a specific contact.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE')")
	@GetMapping(value = "/contacts/{contactId}/tasks", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getContactTasks(@PathVariable Long contactId) {

		ResponseEntityDto response = crmContactService.getContactTasks(contactId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update CRM contact", description = "Updates an existing CRM contact.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE')")
	@PutMapping(value = "/contacts/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateContact(@PathVariable Long id,
			@Valid @RequestBody CrmContactUpdateRequestDto requestDto) {

		ResponseEntityDto response = crmContactService.updateContact(id, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete CRM contact", description = "Soft deletes a CRM contact.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER')")
	@PatchMapping(value = "/contacts/delete/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> deleteContact(@PathVariable Long id) {

		ResponseEntityDto response = crmContactService.deleteContact(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get CRM owners", description = "Retrieves active CRM users who can be assigned as owners.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER')")
	@GetMapping(value = "/owners", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getOwners(@Valid CrmContactOwnerFilterDto filterDto) {

		ResponseEntityDto response = crmContactService.getContactOwners(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
