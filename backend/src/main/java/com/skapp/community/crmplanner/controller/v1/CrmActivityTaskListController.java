package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityTaskFilterDto;
import com.skapp.community.crmplanner.service.CrmActivityTaskListService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/crm/activity/task")
@Tag(name = "CRM Activity Tasks List Controller", description = "Operations related to listing CRM activity tasks")
public class CrmActivityTaskListController {

	private final CrmActivityTaskListService crmActivityTaskListService;

	@GetMapping
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getTasks(CrmActivityTaskFilterDto filterDto) {
		ResponseEntityDto response = crmActivityTaskListService.getTasks(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
