package com.skapp.community.okrplanner.controller;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.payload.request.CompanyObjectiveFilterDto;
import com.skapp.community.okrplanner.payload.request.CompanyObjectiveRequestDto;
import com.skapp.community.okrplanner.service.CompanyObjectiveService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/okr/company-objective")
public class CompanyObjectiveController {

	private final CompanyObjectiveService companyObjectiveService;

	@Operation(summary = "Create Company Objective",
			description = "Create a new company objective with the provided details.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_OKR_ADMIN')")
	@PostMapping
	public ResponseEntity<ResponseEntityDto> createCompanyObjective(
			@RequestBody @Valid CompanyObjectiveRequestDto requestDto) {
		ResponseEntityDto response = companyObjectiveService.createCompanyObjective(requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update an existing company objective",
			description = "Allows the super-admin or okr-admin to update an existing company objective.")
	@PatchMapping("/{id}")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_OKR_ADMIN')")
	public ResponseEntity<ResponseEntityDto> updateCompanyObjective(@PathVariable Long id,
			@RequestBody @Valid CompanyObjectiveRequestDto companyObjectiveRequestDto) {
		ResponseEntityDto response = companyObjectiveService.updateCompanyObjective(id, companyObjectiveRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get company objectives by year",
			description = "Retrieve the company objectives for a specific year")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_OKR_ADMIN', 'ROLE_OKR_EMPLOYEE')")
	@GetMapping
	public ResponseEntity<ResponseEntityDto> getCompanyObjectivesByYear(
			@Valid CompanyObjectiveFilterDto companyObjectiveFilterDto) {
		ResponseEntityDto response = companyObjectiveService.loadCompanyObjectivesByYear(companyObjectiveFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get company objective by id", description = "Retrieve a specific company objective by Id")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_OKR_ADMIN', 'ROLE_OKR_EMPLOYEE')")
	@GetMapping(value = "/{id}")
	public ResponseEntity<ResponseEntityDto> getCompanyObjective(@Valid @PathVariable Long id) {
		ResponseEntityDto response = companyObjectiveService.findCompanyObjectiveById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
