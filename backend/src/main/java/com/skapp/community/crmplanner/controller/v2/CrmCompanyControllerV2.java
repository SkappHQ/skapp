package com.skapp.community.crmplanner.controller.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyMetricRequestDto;
import com.skapp.community.crmplanner.service.v2.CrmCompanyServiceV2;
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
@RequestMapping("/v2/crm/company")
@Tag(name = "CRM Companies Controller V2", description = "Operations related to CRM Companies")
public class CrmCompanyControllerV2 {

	private final CrmCompanyServiceV2 companyService;

	@Operation(summary = "Get companies",
			description = "Returns a paginated list of companies, each with its base details and metrics.")
	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getCompanyMetrics(CrmCompanyMetricRequestDto requestDto) {
		ResponseEntityDto responseDto = companyService.getCompanyMetrics(requestDto);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

}
