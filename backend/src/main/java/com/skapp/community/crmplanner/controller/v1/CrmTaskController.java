package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskStatusUpdateDto;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/crm/task")
@Tag(name = "CRM Task Controller", description = "Operations related to CRM Tasks")
public class CrmTaskController {

	private final CrmTaskService crmTaskService;

	@Operation(summary = "Update task status",
			description = "Updates the completion status of a task and returns the updated task")
	@PatchMapping(value = "/{id}/status", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> updateTaskStatus(@PathVariable Long id,
			@RequestBody CrmTaskStatusUpdateDto taskStatusUpdateDto) {
		ResponseEntityDto response = crmTaskService.updateTaskStatus(id, taskStatusUpdateDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
