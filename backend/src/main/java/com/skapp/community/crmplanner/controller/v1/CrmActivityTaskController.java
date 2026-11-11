package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityTaskEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityTaskFilterDto;
import com.skapp.community.crmplanner.service.CrmActivityTaskListService;
import com.skapp.community.crmplanner.service.CrmActivityTaskService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/crm/activity/task")
@Tag(name = "CRM Activity Tasks Controller", description = "Operations related to CRM activity tasks")
public class CrmActivityTaskController {

	private final CrmActivityTaskListService crmActivityTaskListService;

	private final CrmActivityTaskService crmActivityTaskService;

	@PostMapping
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> createTask(@RequestBody CrmActivityTaskCreateRequestDto requestDto) {
		ResponseEntityDto response = crmActivityTaskService.createTask(requestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@GetMapping
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getTasks(CrmActivityTaskFilterDto filterDto) {
		ResponseEntityDto response = crmActivityTaskListService.getTasks(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getTaskById(@PathVariable Long id) {
		ResponseEntityDto response = crmActivityTaskService.getTaskById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping("/{id}")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> editTask(@PathVariable Long id,
			@RequestBody CrmActivityTaskEditRequestDto requestDto) {
		ResponseEntityDto response = crmActivityTaskService.editTask(id, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/{id}/related")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getRelatedTasks(@PathVariable Long id) {
		ResponseEntityDto response = crmActivityTaskService.getRelatedTasks(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
