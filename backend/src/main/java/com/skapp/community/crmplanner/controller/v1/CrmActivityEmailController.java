package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityEmailFilterDto;
import com.skapp.community.crmplanner.service.CrmActivityEmailService;
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
@RequestMapping("/v1/crm/activity/email")
@Tag(name = "CRM Activity Emails Controller", description = "Operations related to CRM activity emails")
public class CrmActivityEmailController {

	private final CrmActivityEmailService crmActivityEmailService;

	@Operation(summary = "List CRM emails",
			description = "Returns every email visible to the caller. A sales rep sees their own emails, a sales "
					+ "manager sees their own and their team's, and an admin sees all. searchKeyword matches the "
					+ "subject, a linked contact's name or that contact's company. ownerId, startDate and "
					+ "endDate are for managers and admins only. sortKey is LOGGED_AT (default) or OWNER.")
	@GetMapping
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getEmails(CrmActivityEmailFilterDto filterDto) {
		ResponseEntityDto response = crmActivityEmailService.getEmails(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
