package com.skapp.community.crmplanner.controller.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDtoV2;
import com.skapp.community.crmplanner.service.v2.CrmTaskServiceV2;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v2/crm/task")
@Tag(name = "CRM Tasks Controller V2", description = "Operations related to CRM Tasks")
public class CrmTaskControllerV2 {

	private final CrmTaskServiceV2 taskService;

	@Operation(summary = "Get tasks",
			description = "Returns a paginated list of non-deleted CRM tasks with optional search and filter by "
					+ "contact, company and deal. The optional isCompleted filter selects completed (true) or open "
					+ "(false) tasks; omit it to return both. Optional sortKey (DUE_AT default, or LAST_MODIFIED_DATE) "
					+ "and sortOrder (ASC/DESC) control ordering. Pass size < 0 to disable pagination and return "
					+ "every matching task. Related records are carried as id references only.")
	@GetMapping
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getTasks(CrmTaskFilterDtoV2 filterDto) {
		ResponseEntityDto response = taskService.getTasks(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get related tasks",
			description = "Returns a paginated list of tasks related to the given task - i.e. tasks that share every "
					+ "link the source task has, both its contact and its deal when it carries both. A task with "
					+ "neither has no related tasks. Supports pagination only (size < 0 disables pagination and "
					+ "returns every related task).")
	@GetMapping("/{id}/related")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getRelatedTasks(@PathVariable Long id,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		ResponseEntityDto response = taskService.getRelatedTasks(id, page, size);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get CRM task by ID", description = "Returns CRM task details for the provided task ID.")
	@GetMapping("/{id}")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getTaskById(@PathVariable Long id) {
		ResponseEntityDto response = taskService.getTaskById(id);
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
