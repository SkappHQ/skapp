package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.service.CrmActivityFeedService;
import com.skapp.community.crmplanner.service.CrmActivityTeamMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

	private final CrmActivityTeamMemberService crmActivityTeamMemberService;

	@Operation(summary = "Get activity feed",
			description = "Returns tasks, calls, meetings and emails in one feed grouped into overdue, today, "
					+ "upcoming and by-month buckets in the X-Timezone zone. Overdue, today and upcoming are returned "
					+ "in full on page 0; by-month is paged. A sales representative sees only their own activities "
					+ "and their ownerId, from and to filters are ignored; a sales manager sees their own, their "
					+ "direct reports' and their supervised teams' activities.")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getActivities(CrmActivityFeedFilterDto filterDto) {
		ResponseEntityDto response = crmActivityFeedService.getActivities(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get activity team members",
			description = "Returns the CRM users whose activities the viewer can filter by: the team for a sales "
					+ "manager, everyone for a CRM admin.")
	@GetMapping(value = "/team-members", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getTeamMembers() {
		ResponseEntityDto response = crmActivityTeamMemberService.getTeamMembers();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
