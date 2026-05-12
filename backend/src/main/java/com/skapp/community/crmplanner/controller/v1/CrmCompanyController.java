package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.crmplanner.payload.request.CrmCompanyFilterDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyUpdateDto;
import com.skapp.community.crmplanner.service.CrmCompanyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/company")
@Tag(name = "CRM Companies Controller", description = "Operations related to CRM Companies")
public class CrmCompanyController {

  @NonNull
  private final CrmCompanyService companyService;

  @Operation(summary = "Check if a company name exists", description = "Check if a company with the given name already exists")
  @GetMapping("/exists")
  @PreAuthorize("hasAnyRole('ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE','ROLE_CRM_NONE')")
  public ResponseEntity<ResponseEntityDto> checkCompanyNameExists(@RequestParam String name) {
    ResponseEntityDto responseDto = companyService.checkCompanyNameExists(name);
    return new ResponseEntity<>(responseDto, HttpStatus.OK);
  }

  @Operation(summary = "Get all companies", description = "Get all registered companies in the database")
  @GetMapping
  @PreAuthorize("hasAnyRole('ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE','ROLE_CRM_NONE')")
  public ResponseEntity<ResponseEntityDto> getAllCompanies() {
    ResponseEntityDto responseDto = companyService.getAllCompanies();
    return new ResponseEntity<>(responseDto, HttpStatus.OK);
  }

  @Operation(summary = "Create a new company", description = "Create a new company")
  @PostMapping
  @PreAuthorize("hasAnyRole('ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE','ROLE_CRM_NONE')")
  public ResponseEntity<ResponseEntityDto> createCompany(@Valid @RequestBody CrmCompanyCreateDto crmCompany) {
    ResponseEntityDto responseDto = companyService.createCompany(crmCompany);
    return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
  }

  @Operation(summary = "Get a company by ID", description = "Get a company by ID")
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE','ROLE_CRM_NONE')")
  public ResponseEntity<ResponseEntityDto> getCompany(@PathVariable Long id) {
    ResponseEntityDto responseDto = companyService.getCompany(id);
    return new ResponseEntity<>(responseDto, HttpStatus.OK);
  }

  @Operation(summary = "Delete a company by ID", description = "Delete a company by ID")
  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER')")
  public ResponseEntity<ResponseEntityDto> deleteCompany(@PathVariable Long id) {
    ResponseEntityDto responseDto = companyService.deleteCompany(id);
    return new ResponseEntity<>(responseDto, HttpStatus.OK);
  }

  @Operation(summary = "Update company", description = "Update company details")
  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER')")
  public ResponseEntity<ResponseEntityDto> updateCompany(@PathVariable Long id,
      @Valid @RequestBody CrmCompanyUpdateDto updatedCompany) {
    ResponseEntityDto responseDto = companyService.updateCompany(id, updatedCompany);
    return new ResponseEntity<>(responseDto, HttpStatus.OK);
  }

  @Operation(summary = "Get CRM companies for lookup",
			description = "Retrieves a paginated list of CRM companies (id + name) for use in dropdowns and contact forms.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE')")
	@GetMapping(value = "/companies/lookup", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getCompaniesLookup(@Valid CrmCompanyFilterDto filterDto) {

		ResponseEntityDto response = companyService.getCompanies(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
}
