package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmDealsByStagesRequestDto;
import com.skapp.community.crmplanner.service.CrmDealService;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/crm/deal")
@Tag(name = "CRM Deal Controller", description = "Operations related to CRM deals")
public class CrmDealController {

	private final CrmDealService crmDealService;

	@Operation(summary = "Create a new deal",
			description = "This endpoint creates a new CRM deal with the provided details.")
	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> createDeal(@RequestBody CrmDealCreateRequestDto crmDealCreateRequestDto) {
		ResponseEntityDto response = crmDealService.createDeal(crmDealCreateRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get deals", description = "Returns a paginated list of CRM deals with optional filtering.")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getDeals(CrmDealFilterDto crmDealFilterDto) {
		ResponseEntityDto response = crmDealService.getDeals(crmDealFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get deals grouped by stages",
			description = "Returns deals grouped by the requested stages. Multi-stage requests return first-page data for each stage; single-stage requests support page-based swim-lane loading.")
	@PostMapping(value = "/grouped-by-stages", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getDealsByStages(
			@RequestBody CrmDealsByStagesRequestDto crmDealsByStagesRequestDto) {
		ResponseEntityDto response = crmDealService.getDealsByStages(crmDealsByStagesRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
