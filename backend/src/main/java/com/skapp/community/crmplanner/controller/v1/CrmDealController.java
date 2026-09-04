package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmDealIdsRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmDealListViewConfigDto;
import com.skapp.community.crmplanner.service.CrmDealListViewConfigService;
import com.skapp.community.crmplanner.service.CrmDealService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/crm/deal")
@Tag(name = "CRM Deal Controller", description = "Operations related to CRM deals")
public class CrmDealController {

	private final CrmDealService crmDealService;

	private final CrmDealListViewConfigService crmDealListViewConfigService;

	@Operation(summary = "Get deals by ids",
			description = "Returns the base details of the deals matching the given ids, used to hydrate the "
					+ "client's deal store. Unknown, deleted and - for a sales representative - other owners' "
					+ "deals are omitted.")
	@PostMapping("/ids")
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getDealsByIds(@RequestBody CrmDealIdsRequestDto requestDto) {
		ResponseEntityDto response = crmDealService.getDealsByIds(requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Check if a deal name exists",
			description = "Check if a deal with the given name already exists")
	@GetMapping("/exists")
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> checkDealNameExists(@RequestParam String name) {
		ResponseEntityDto responseDto = crmDealService.checkDealNameExists(name);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

	@Operation(summary = "Create a new deal",
			description = "This endpoint creates a new CRM deal with the provided details.")
	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> createDeal(@RequestBody CrmDealCreateRequestDto crmDealCreateRequestDto) {
		ResponseEntityDto response = crmDealService.createDeal(crmDealCreateRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get deals", description = "Returns a paginated list of CRM deals with optional filtering.")
	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getDeals(CrmDealFilterDto crmDealFilterDto) {
		ResponseEntityDto response = crmDealService.getDeals(crmDealFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Edit an existing deal by ID", description = "Updates details of an existing deal.")
	@PatchMapping("/{id}")
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> editDeal(@PathVariable Long id,
			@RequestBody CrmDealEditRequestDto requestDto) {
		ResponseEntityDto response = crmDealService.editDeal(id, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get deal by ID", description = "Returns a single CRM deal by its ID.")
	@GetMapping("/{id}")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getDealById(@PathVariable Long id) {
		ResponseEntityDto response = crmDealService.getDealById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete a deal by ID",
			description = "Soft deletes a deal and all tasks linked to that deal. Only accessible by admins and sales managers.")
	@DeleteMapping("/{id}")
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_MANAGER')")
	public ResponseEntity<ResponseEntityDto> deleteDeal(@PathVariable Long id) {
		ResponseEntityDto response = crmDealService.deleteDeal(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get the current user's deal list-view config",
			description = "Returns the user's saved deal list-view config, or the default when nothing is saved.")
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	@GetMapping("/list-view-config")
	public ResponseEntity<ResponseEntityDto> getListViewConfig() {
		ResponseEntityDto response = crmDealListViewConfigService.getListViewConfig();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update the current user's deal list-view config",
			description = "Persists the deal table config sent by the client; does not affect other users.")
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	@PutMapping("/list-view-config")
	public ResponseEntity<ResponseEntityDto> updateListViewConfig(@RequestBody CrmDealListViewConfigDto config) {
		ResponseEntityDto response = crmDealListViewConfigService.updateListViewConfig(config);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
