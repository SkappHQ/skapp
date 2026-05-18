package com.skapp.community.crmplanner.controller.v1;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.service.CrmCompanyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/company")
@Tag(name = "CRM Companies Controller", description = "Operations related to CRM Companies")
public class CrmCompanyController {

	private final CrmCompanyService companyService;

	@Operation(summary = "Check if a company name exists",
			description = "Check if a company with the given name already exists")
	@GetMapping("/exists")
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> checkCompanyNameExists(@RequestParam String name) {
		ResponseEntityDto responseDto = companyService.checkCompanyNameExists(name);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

	@Operation(summary = "Create a new company", description = "Create a new company")
	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> createCompany(@RequestBody CrmCompanyCreateDto crmCompany) {
		ResponseEntityDto responseDto = companyService.createCompany(crmCompany);
		return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
	}

	@Operation(summary = "Get company metrics",
			description = "Returns all details related to company info, tasks and deals")
	@GetMapping("/metrics")
	@PreAuthorize("hasAnyRole('ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<PageDto> getCompanyMetrics(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "8") int size, @RequestParam(required = false) String searchKeyword) {
		Pageable pageable = PageRequest.of(page, size);
		PageDto responseDto = companyService.getCompanyMetrics(searchKeyword, pageable);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

}
