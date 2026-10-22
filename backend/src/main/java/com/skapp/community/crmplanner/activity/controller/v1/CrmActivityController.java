package com.skapp.community.crmplanner.activity.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityTeamMemberFilterDto;
import com.skapp.community.crmplanner.activity.service.CrmActivityFeedService;
import com.skapp.community.crmplanner.activity.service.CrmActivityScopeService;
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
@RequestMapping("/v1/crm/activities")
@Tag(name = "CRM Activities Controller", description = "Operations related to the CRM activity feed")
public class CrmActivityController {

	private final CrmActivityFeedService crmActivityFeedService;

	private final CrmActivityScopeService crmActivityScopeService;

	@Operation(summary = "Get the activity feed",
			description = "Returns tasks, calls, meetings and emails visible to the caller, grouped into overdue, "
					+ "today and upcoming (returned in full on page 0) and a by-month history paged 25 at a time. "
					+ "Buckets use the X-Timezone header. ownerId, from and to apply to managers and admins only.")
	@GetMapping
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getActivityFeed(CrmActivityFeedFilterDto filterDto) {
		ResponseEntityDto response = crmActivityFeedService.getActivityFeed(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get team members for the activity feed filter",
			description = "Returns the CRM users whose activities the caller can filter by: the caller's team for a "
					+ "sales manager and every CRM user for an admin.")
	@GetMapping("/team-members")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getTeamMembers(CrmActivityTeamMemberFilterDto filterDto) {
		ResponseEntityDto response = crmActivityScopeService.getTeamMembers(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
