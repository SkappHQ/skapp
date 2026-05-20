package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyFilterDto;
import com.skapp.community.crmplanner.service.CrmCompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1")
@Tag(name = "CRM Company Controller", description = "Endpoints for CRM company")
public class CrmCompanyController {

	private final CrmCompanyService crmCompanyService;

	@Operation(summary = "Get CRM companies for lookup",
			description = "Retrieves a paginated list of CRM companies (id + name) for use in dropdowns and contact forms.")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	@GetMapping(value = "/crm/companies/lookup", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getCompaniesLookup(CrmCompanyFilterDto filterDto) {
		ResponseEntityDto response = crmCompanyService.getCompanies(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Check if a company name exists",
			description = "Check if a company with the given name already exists")
	@GetMapping(value = "/company/exists", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> checkCompanyNameExists(@RequestParam String name) {
		ResponseEntityDto responseDto = crmCompanyService.checkCompanyNameExists(name);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

	@Operation(summary = "Create a new company", description = "Create a new company")
	@PostMapping(value = "/company", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> createCompany(@RequestBody CrmCompanyCreateDto crmCompany) {
		ResponseEntityDto responseDto = crmCompanyService.createCompany(crmCompany);
		return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
	}

}
