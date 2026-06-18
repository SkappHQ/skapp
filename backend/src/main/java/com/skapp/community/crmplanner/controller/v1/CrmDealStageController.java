package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.service.CrmDealStageService;
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
@RequestMapping("/v1/crm/deal/stage")
@Tag(name = "CRM Deal Stage Controller", description = "Operations related to CRM deal stages")
public class CrmDealStageController {

	private final CrmDealStageService crmDealStageService;

	@Operation(summary = "Get deal stages", description = "Returns all active deal stages ordered by index.")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getDealStages() {
		ResponseEntityDto response = crmDealStageService.getDealStages();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
