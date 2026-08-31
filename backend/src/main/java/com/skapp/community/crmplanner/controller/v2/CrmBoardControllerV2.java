package com.skapp.community.crmplanner.controller.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.service.CrmDealService;
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
@RequestMapping("/v2/crm/board")
@Tag(name = "CRM Board Controller V2", description = "Operations related to CRM board")
public class CrmBoardControllerV2 {

	private final CrmDealService crmDealService;

	@Operation(summary = "Get board init data",
			description = "Returns all data required for the kanban board initial load: stages, contacts, CRM roles, owners, task types, and industries.")
	@GetMapping("/init-data")
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getBoardInitData() {
		ResponseEntityDto response = crmDealService.getBoardInitDataV2();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
