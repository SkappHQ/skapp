package com.skapp.community.crmplanner.controller.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmIndustryCreateDto;
import com.skapp.community.crmplanner.service.v2.CrmIndustryServiceV2;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/v2/crm/industry")
@Tag(name = "CRM Industries Controller V2", description = "Operations related to CRM Industries")
public class CrmIndustryControllerV2 {

	private final CrmIndustryServiceV2 industryService;

	@Operation(summary = "Create an industry",
			description = "Creates an organisation-wide industry. The name is trimmed and its internal whitespace "
					+ "collapsed before a case-insensitive uniqueness check. If the industry already exists it is "
					+ "returned as-is with alreadyExists set to true rather than being duplicated. "
					+ "The industry list itself is served by the board init-data endpoint. "
					+ "Restricted to CRM Sales Managers and CRM Admins.")
	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_MANAGER')")
	public ResponseEntity<ResponseEntityDto> createIndustry(@RequestBody CrmIndustryCreateDto requestDto) {
		ResponseEntityDto responseDto = industryService.createIndustry(requestDto);
		return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
	}

}
