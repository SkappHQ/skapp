package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmDealStageCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealStageEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealStageReorderRequestDto;
import com.skapp.community.crmplanner.service.CrmDealStageService;
import io.swagger.v3.oas.annotations.Operation;

import java.util.List;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

	@Operation(summary = "Create a deal stage", description = "Creates a new deal stage.")
	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_CRM_ADMIN')")
	public ResponseEntity<ResponseEntityDto> createDealStage(@RequestBody CrmDealStageCreateRequestDto requestDto) {
		ResponseEntityDto response = crmDealStageService.createDealStage(requestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Edit a deal stage", description = "Updates a deal stage. All fields are optional.")
	@PatchMapping("/{id}")
	@PreAuthorize("hasAnyRole('ROLE_CRM_ADMIN')")
	public ResponseEntity<ResponseEntityDto> editDealStage(@PathVariable Long id,
			@RequestBody CrmDealStageEditRequestDto requestDto) {
		ResponseEntityDto response = crmDealStageService.editDealStage(id, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete a deal stage", description = "Soft-deletes a deal stage.")
	@DeleteMapping("/{id}")
	@PreAuthorize("hasAnyRole('ROLE_CRM_ADMIN')")
	public ResponseEntity<ResponseEntityDto> deleteDealStage(@PathVariable Long id) {
		ResponseEntityDto response = crmDealStageService.deleteDealStage(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Reorder deal stages", description = "Reorders all deal stages.")
	@PostMapping("/reorder")
	@PreAuthorize("hasAnyRole('ROLE_CRM_ADMIN')")
	public ResponseEntity<ResponseEntityDto> reorderDealStages(
			@RequestBody List<CrmDealStageReorderRequestDto> stages) {
		ResponseEntityDto response = crmDealStageService.reorderDealStages(stages);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
