package com.skapp.community.okrplanner.controller;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.payload.request.CompanyObjectiveRequestDto;
import com.skapp.community.okrplanner.service.CompanyObjectiveService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/company-objective")
public class CompanyObjectiveController {

	private final CompanyObjectiveService companyObjectiveService;

	@Operation(summary = "Create Company Objective",
			description = "Create a new company objective with the provided details.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_OKR_ADMIN')")
	@PostMapping
	public ResponseEntity<ResponseEntityDto> createTeamObjective(
			@RequestBody @Valid CompanyObjectiveRequestDto requestDto) {
		ResponseEntityDto response = companyObjectiveService.createCompanyObjective(requestDto);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

}
