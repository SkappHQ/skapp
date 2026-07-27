package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyFilterDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyUpdateRequestDto;
import com.skapp.community.leaveplanner.service.LeavePolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/leave/policies")
@Tag(name = "Leave Policy Controller", description = "Operations related to leave policies")
public class LeavePolicyController {

	private final LeavePolicyService leavePolicyService;

	@Operation(summary = "Get all leave policies",
			description = "Returns a paginated list of leave policies with optional search by name and leave type filter")
	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN', 'ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getAllLeavePolicies(LeavePolicyFilterDto leavePolicyFilterDto) {
		ResponseEntityDto response = leavePolicyService.getAllLeavePolicies(leavePolicyFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Create a new leave policy",
			description = "Creates a new leave policy with accrual or fixed entitlement configuration")
	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> addLeavePolicy(@RequestBody LeavePolicyRequestDto leavePolicyRequestDto) {
		ResponseEntityDto response = leavePolicyService.addLeavePolicy(leavePolicyRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Update a leave policy", description = "Updates the name of an existing leave policy")
	@PutMapping("/{id}")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> updateLeavePolicy(@PathVariable Long id,
			@RequestBody LeavePolicyUpdateRequestDto leavePolicyUpdateRequestDto) {
		ResponseEntityDto response = leavePolicyService.updateLeavePolicy(id, leavePolicyUpdateRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Deactivate a leave policy", description = "Marks an existing leave policy as inactive")
	@PatchMapping("/{id}/deactivate")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> deactivateLeavePolicy(@PathVariable Long id) {
		ResponseEntityDto response = leavePolicyService.deactivateLeavePolicy(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Enable leave policies",
			description = "Enables the leave policies feature for an existing tenant. Removes all existing leave "
					+ "allocations, cancels pending leave requests and revokes approved leave requests that start in "
					+ "the future. This action is irreversible.")
	@PostMapping("/enable")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> enableLeavePolicies() {
		ResponseEntityDto response = leavePolicyService.enableLeavePolicies();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get leave policy configuration",
			description = "Returns whether the leave policies feature is enabled for the tenant")
	@GetMapping("/config")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<ResponseEntityDto> getLeavePolicyConfig() {
		ResponseEntityDto response = leavePolicyService.getLeavePolicyConfig();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
