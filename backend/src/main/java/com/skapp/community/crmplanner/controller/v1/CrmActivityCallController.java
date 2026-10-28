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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/crm/activity/call")
@Tag(name = "CRM Activity Calls Controller", description = "Operations related to CRM activity calls")
public class CrmActivityCallController {

	private final CrmActivityCallService crmActivityCallService;

	@GetMapping
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getCalls(CrmActivityCallFilterDto filterDto) {
		ResponseEntityDto response = crmActivityCallService.getCalls(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasRole('ROLE_CRM_SALES_REPRESENTATIVE')")
	public ResponseEntity<ResponseEntityDto> getCallById(@PathVariable Long id) {
		ResponseEntityDto response = crmActivityCallService.getCallById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
