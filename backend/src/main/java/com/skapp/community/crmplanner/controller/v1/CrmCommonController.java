package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.service.CrmCommonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "CRM Common Controller", description = "Common CRM operations shared across modules")
public class CrmCommonController {

	private final CrmCommonService crmCommonService;

	@Operation(summary = "Get priorities", description = "Returns all CRM priorities ordered by index.")
	@GetMapping(value = "/priorities", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_CRM_ADMIN', 'ROLE_CRM_SALES_MANAGER', 'ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getPriorities() {
		ResponseEntityDto response = crmCommonService.getPriorities();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
