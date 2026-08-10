package com.skapp.community.crmplanner.controller.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactMetricRequestDto;
import com.skapp.community.crmplanner.service.v2.CrmContactServiceV2;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v2/crm/contact")
@Tag(name = "CRM Contacts Controller V2", description = "Operations related to CRM Contacts")
public class CrmContactControllerV2 {

	private final CrmContactServiceV2 contactService;

	@Operation(summary = "Create CRM contact", description = "Creates a CRM contact and assigns an owner.")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	@PostMapping
	public ResponseEntity<ResponseEntityDto> createContact(@RequestBody CrmContactCreateRequestDto requestDto) {
		ResponseEntityDto response = contactService.createContact(requestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Edit CRM contact", description = "Updates an existing CRM contact.")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	@PatchMapping("/{id}")
	public ResponseEntity<ResponseEntityDto> editContact(@PathVariable Long id,
			@RequestBody CrmContactEditRequestDto requestDto) {
		ResponseEntityDto response = contactService.editContact(id, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get CRM contact by ID", description = "Returns the base contact with its company and owner.")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	@GetMapping("/{id}")
	public ResponseEntity<ResponseEntityDto> getContactById(@PathVariable Long id) {
		ResponseEntityDto response = contactService.getContactById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get contact metrics",
			description = "Returns a paginated list of contacts with closed-deal and open-task metrics.")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	@GetMapping("/metrics")
	public ResponseEntity<ResponseEntityDto> getContactMetrics(CrmContactMetricRequestDto filterDto) {
		ResponseEntityDto response = contactService.getContactMetrics(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
