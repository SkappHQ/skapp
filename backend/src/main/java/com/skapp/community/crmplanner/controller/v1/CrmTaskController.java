package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;
import com.skapp.community.crmplanner.service.CrmTaskService;
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
@RequestMapping("/v1/crm/task")
@Tag(name = "CRM Tasks Controller", description = "Operations related to CRM Tasks")
public class CrmTaskController {

	private final CrmTaskService crmTaskService;

	@Operation(summary = "Get tasks", description = "Returns all non-deleted CRM tasks.")
	@GetMapping
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getTasks() {
		ResponseEntityDto response = crmTaskService.getTasks();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Create a CRM task",
			description = "Creates a task optionally linked to a contact, company and/or deal, "
					+ "with the current user as owner unless an owner is specified.")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	@PostMapping
	public ResponseEntity<ResponseEntityDto> createTask(@RequestBody CrmTaskCreateRequestDto requestDto) {
		ResponseEntityDto response = crmTaskService.createTask(requestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

}

