package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmIndustryFilterDto;
import com.skapp.community.crmplanner.service.CrmIndustryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/crm/industry")
@Tag(name = "CRM Industry Controller", description = "Operations related to CRM industries")
public class CrmIndustryController {

	private final CrmIndustryService crmIndustryService;

	@Operation(summary = "Get CRM industries for lookup",
			description = "Retrieves a paginated list of CRM industries (id + name), ordered by name, for use in dropdowns.")
	@GetMapping("/lookup")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getIndustriesLookup(CrmIndustryFilterDto filterDto) {
		ResponseEntityDto response = crmIndustryService.getIndustriesLookup(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
