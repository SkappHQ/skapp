package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.service.PolicyLeaveTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/leave/policy-leave-types")
@Tag(name = "Policy Leave Type Controller",
		description = "Operations related to leave types available for leave policies")
public class PolicyLeaveTypeController {

	private final PolicyLeaveTypeService policyLeaveTypeService;

	@Operation(summary = "Get policy leave types",
			description = "Returns all active leave types available for policy creation")
	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getPolicyLeaveTypes() {
		ResponseEntityDto response = policyLeaveTypeService.getPolicyLeaveTypes();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
