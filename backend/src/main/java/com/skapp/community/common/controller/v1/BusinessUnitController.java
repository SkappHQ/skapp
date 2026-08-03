package com.skapp.community.common.controller.v1;

import com.skapp.community.common.payload.request.BusinessUnitRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.BusinessUnitService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/v1/com/business-unit")
public class BusinessUnitController {

	private final BusinessUnitService businessUnitService;

	@Operation(summary = "Get all business units",
			description = "Retrieves the full list of business units, sorted alphabetically by name, for the Organization Configuration page.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	@GetMapping
	public ResponseEntity<ResponseEntityDto> getAllBusinessUnits() {
		ResponseEntityDto response = businessUnitService.getAllBusinessUnits();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get a business unit by ID")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	@GetMapping(value = "/{id}")
	public ResponseEntity<ResponseEntityDto> getBusinessUnitById(@PathVariable Long id) {
		ResponseEntityDto response = businessUnitService.getBusinessUnitById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Create a business unit")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	@PostMapping
	public ResponseEntity<ResponseEntityDto> createBusinessUnit(
			@RequestBody BusinessUnitRequestDto businessUnitRequestDto) {
		ResponseEntityDto response = businessUnitService.createBusinessUnit(businessUnitRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Update a business unit")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	@PatchMapping(value = "/{id}")
	public ResponseEntity<ResponseEntityDto> updateBusinessUnit(@PathVariable Long id,
			@RequestBody BusinessUnitRequestDto businessUnitRequestDto) {
		ResponseEntityDto response = businessUnitService.updateBusinessUnit(id, businessUnitRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get the impact of deleting a business unit",
			description = "Returns the number of employees assigned to the business unit and whether other business units exist, used to determine the delete confirmation flow.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	@GetMapping(value = "/{id}/deletion-impact")
	public ResponseEntity<ResponseEntityDto> getBusinessUnitDeletionImpact(@PathVariable Long id) {
		ResponseEntityDto response = businessUnitService.getBusinessUnitDeletionImpact(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete a business unit",
			description = "Deletes the business unit. Optionally transfers its assigned employees to another business unit via transferToBusinessUnitId; otherwise they are unassigned.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	@DeleteMapping(value = "/{id}")
	public ResponseEntity<ResponseEntityDto> deleteBusinessUnit(@PathVariable Long id,
			@RequestParam(required = false) Long transferToBusinessUnitId) {
		ResponseEntityDto response = businessUnitService.deleteBusinessUnit(id, transferToBusinessUnitId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
