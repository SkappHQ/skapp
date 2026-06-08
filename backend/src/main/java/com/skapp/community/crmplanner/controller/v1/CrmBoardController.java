package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.board.CrmDealsByStagesRequestDto;
import com.skapp.community.crmplanner.service.CrmDealService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/crm/board")
@Tag(name = "CRM Board Controller", description = "Operations related to CRM board")
public class CrmBoardController {

	private final CrmDealService crmDealService;

	@Operation(summary = "Get board init data",
			description = "Returns all data required for the kanban board initial load: stages, contacts, CRM roles, and owners.")
	@GetMapping("/init-data")
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getBoardInitData() {
		ResponseEntityDto response = crmDealService.getBoardInitData();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get deals grouped by stages",
			description = "Returns deals grouped by the requested stages. Multi-stage requests return first-page data for each stage; single-stage requests support page-based swim-lane loading.")
	@PostMapping("/deals/grouped-by-stages")
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getDealsByStages(
			@RequestBody CrmDealsByStagesRequestDto crmDealsByStagesRequestDto) {
		ResponseEntityDto response = crmDealService.getDealsByStages(crmDealsByStagesRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
