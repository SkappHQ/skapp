package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCompletedFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskEditRequestDto;
import com.skapp.community.crmplanner.service.CrmTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

	private final CrmTaskService taskService;

	@Operation(summary = "Get tasks", description = "Returns all open non-deleted CRM tasks.")
	@GetMapping
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getTasks() {
		ResponseEntityDto response = taskService.getTasks();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get completed tasks",
			description = "Returns a paginated list of completed non-deleted CRM tasks.")
	@GetMapping("/completed")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getCompletedTasks(CrmTaskCompletedFilterDto filterDto) {
		ResponseEntityDto response = taskService.getCompletedTasks(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Create a CRM task",
			description = "Creates a task optionally linked to a contact, company and/or deal, "
					+ "with the current user as owner unless an owner is specified.")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	@PostMapping
	public ResponseEntity<ResponseEntityDto> createTask(@RequestBody CrmTaskCreateRequestDto requestDto) {
		ResponseEntityDto response = taskService.createTask(requestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Edit task",
			description = "Updates the provided fields of a task and returns the updated task")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> editTask(@PathVariable Long id,
			@RequestBody CrmTaskEditRequestDto requestDto) {
		ResponseEntityDto response = taskService.editTask(id, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
