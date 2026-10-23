package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityEmailFilterDto;
import com.skapp.community.crmplanner.service.CrmActivityEmailService;
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

	@GetMapping
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getEmails(CrmActivityEmailFilterDto filterDto) {
		ResponseEntityDto response = crmActivityEmailService.getEmails(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
