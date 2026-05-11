package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyFilterDto;
import com.skapp.community.crmplanner.service.CrmCompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/crm")
@Tag(name = "CRM Company Controller", description = "Endpoints for CRM company lookup")
public class CrmCompanyController {

	private final CrmCompanyService crmCompanyService;

	@Operation(summary = "Get CRM companies",
			description = "Retrieves a paginated and optionally filtered list of seeded CRM companies.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_CRM_ADMIN','ROLE_CRM_SALES_MANAGER','ROLE_CRM_SALES_REPRESENTATIVE')")
	@GetMapping(value = "/companies", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getCompanies(@Valid CrmCompanyFilterDto filterDto) {

		ResponseEntityDto response = crmCompanyService.getCompanies(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
