package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.service.CrmTaskTypeService;
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
@RequestMapping("/v1/crm/task/type")
@Tag(name = "CRM Task Type Controller", description = "Operations related to CRM task types")
public class CrmTaskTypeController {

	private final CrmTaskTypeService crmTaskTypeService;

	@Operation(summary = "Get task types", description = "Returns all task types ordered by index.")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getTaskTypes() {
		ResponseEntityDto response = crmTaskTypeService.getTaskTypes();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
