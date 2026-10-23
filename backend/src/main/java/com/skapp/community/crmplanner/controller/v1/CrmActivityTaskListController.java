package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityTaskFilterDto;
import com.skapp.community.crmplanner.service.CrmActivityTaskListService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/v1/crm/activities/tasks")
@Tag(name = "CRM Activity Tasks List Controller", description = "Operations related to listing CRM activity tasks")
public class CrmActivityTaskListController {

	private final CrmActivityTaskListService crmActivityTaskListService;

	@Operation(summary = "List CRM activity tasks",
			description = "Returns every task visible to the caller. A sales rep sees their own tasks, a sales "
					+ "manager sees their own and their team's, and an admin sees all. searchKeyword matches the "
					+ "name, the linked contact's name or that contact's company. ownerId, startDate and "
					+ "endDate (applied to the due date) are for managers and admins only. sortKey is DUE_AT "
					+ "(default) or OWNER.")
	@GetMapping
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getTasks(CrmActivityTaskFilterDto filterDto) {
		ResponseEntityDto response = crmActivityTaskListService.getTasks(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
