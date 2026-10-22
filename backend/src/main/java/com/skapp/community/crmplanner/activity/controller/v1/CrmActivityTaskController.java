package com.skapp.community.crmplanner.activity.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityTaskCompleteRequestDto;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityTaskEditRequestDto;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityTaskRelatedFilterDto;
import com.skapp.community.crmplanner.activity.service.CrmActivityTaskService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/crm/activities/tasks")
@Tag(name = "CRM Activity Tasks Controller", description = "Operations related to CRM activity tasks")
public class CrmActivityTaskController {

	private final CrmActivityTaskService crmActivityTaskService;

	@Operation(summary = "Complete or reopen an activity task",
			description = "Sets isCompleted on the task. Completing stamps completedAt with the current time and "
					+ "reopening clears it. Returns the updated feed row. Allowed for the owner, a sales manager "
					+ "whose team includes the owner, and CRM or super admins.")
	@PatchMapping(value = "/{id}/complete", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> completeTask(@PathVariable Long id,
			@RequestBody CrmActivityTaskCompleteRequestDto requestDto) {
		ResponseEntityDto response = crmActivityTaskService.completeTask(id, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get activity task by ID",
			description = "Returns the activity task details when the task is within the caller's feed scope.")
	@GetMapping("/{id}")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getTaskById(@PathVariable Long id) {
		ResponseEntityDto response = crmActivityTaskService.getTaskById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Edit activity task",
			description = "Updates the provided fields of an activity task and returns the updated task. Changing "
					+ "isCompleted sets or clears completedAt.")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> editTask(@PathVariable Long id,
			@RequestBody CrmActivityTaskEditRequestDto requestDto) {
		ResponseEntityDto response = crmActivityTaskService.editTask(id, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete activity task", description = "Soft-deletes an activity task by ID.")
	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> deleteTask(@PathVariable Long id) {
		ResponseEntityDto response = crmActivityTaskService.deleteTask(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get related activity tasks",
			description = "Returns a paginated list of activity tasks that share every link the source task has "
					+ "(its contact and its deal when it carries both), limited to the caller's feed scope "
					+ "(size <= 0 disables pagination).")
	@GetMapping("/{id}/related")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getRelatedTasks(@PathVariable Long id,
			CrmActivityTaskRelatedFilterDto filterDto) {
		ResponseEntityDto response = crmActivityTaskService.getRelatedTasks(id, filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
