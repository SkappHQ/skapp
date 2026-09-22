package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskRelatedFilterDto;
import com.skapp.community.crmplanner.service.CrmTaskService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/v1/crm/task")
@Tag(name = "CRM Tasks Controller", description = "Operations related to CRM Tasks")
public class CrmTaskController {

	private final CrmTaskService taskService;

	@Operation(summary = "Get tasks",
			description = "Returns a paginated list of non-deleted CRM tasks. Supports search, filtering by owner, "
					+ "contact, company, deal and completion state, and sorting via sortKey/sortOrder. Returns both "
					+ "open and completed tasks unless isCompleted is supplied (size <= 0 disables pagination and "
					+ "returns every match).")
	@GetMapping
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getTasks(CrmTaskFilterDto filterDto) {
		ResponseEntityDto response = taskService.getTasks(filterDto);
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

	@Operation(summary = "Delete a CRM task", description = "Soft-deletes a task by ID.")
	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> deleteTask(@PathVariable Long id) {
		ResponseEntityDto response = taskService.deleteTask(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get related tasks",
			description = "Returns a paginated list of tasks related to the given task - i.e. tasks that share every "
					+ "link the source task has, both its contact and its deal when it carries both. A task with "
					+ "neither has no related tasks. Supports pagination only (size <= 0 disables pagination and "
					+ "returns every related task).")
	@GetMapping("/{id}/related")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getRelatedTasks(@PathVariable Long id, CrmTaskRelatedFilterDto filterDto) {
		ResponseEntityDto response = taskService.getRelatedTasks(id, filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
