package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityCallFilterDto;
import com.skapp.community.crmplanner.service.CrmActivityCallService;
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
@RequestMapping("/v1/crm/activity")
@Tag(name = "CRM Activity Controller", description = "Operations related to CRM activities")
public class CrmActivityController {

	private final CrmActivityCallService crmActivityCallService;

	@GetMapping("/call")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getCalls(CrmActivityCallFilterDto filterDto) {
		ResponseEntityDto response = crmActivityCallService.getCalls(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
