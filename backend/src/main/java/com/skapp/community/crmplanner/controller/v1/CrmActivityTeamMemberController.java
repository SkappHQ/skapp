package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.service.CrmActivityTeamMemberService;
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
@RequestMapping("/v1/crm/activities/team-members")
@Tag(name = "CRM Activity Team Members Controller",
		description = "Operations related to the CRM users an activity feed can be filtered by")
public class CrmActivityTeamMemberController {

	private final CrmActivityTeamMemberService crmActivityTeamMemberService;

	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_CRM_SALES_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getTeamMembers() {
		ResponseEntityDto response = crmActivityTeamMemberService.getTeamMembers();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
