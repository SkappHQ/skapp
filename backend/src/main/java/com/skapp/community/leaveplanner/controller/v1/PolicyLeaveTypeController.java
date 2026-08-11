package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeUpdateRequestDto;
import com.skapp.community.leaveplanner.service.PolicyLeaveTypeService;
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
import org.springframework.web.bind.annotation.RequestBody;
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
			description = "Returns a paginated list of leave types with an optional active status filter. "
					+ "A negative size returns every matching leave type unpaginated, which is how policy "
					+ "creation dropdowns fetch the active types")
	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN','ROLE_LEAVE_MANAGER','ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getPolicyLeaveTypes(PolicyLeaveTypeFilterDto policyLeaveTypeFilterDto) {
		ResponseEntityDto response = policyLeaveTypeService.getPolicyLeaveTypes(policyLeaveTypeFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get a policy leave type by id",
			description = "Returns the full details of a single leave type regardless of its active status")
	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getPolicyLeaveTypeById(@PathVariable Long id) {
		ResponseEntityDto response = policyLeaveTypeService.getPolicyLeaveTypeById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Create a new policy leave type",
			description = "Creates a new leave type that can be used when creating leave policies")
	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> addPolicyLeaveType(
			@RequestBody PolicyLeaveTypeRequestDto policyLeaveTypeRequestDto) {
		ResponseEntityDto response = policyLeaveTypeService.addPolicyLeaveType(policyLeaveTypeRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Update a policy leave type",
			description = "Updates the provided attributes of a leave type; omitted attributes are unchanged")
	@PatchMapping("/{id}")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> updatePolicyLeaveType(@PathVariable Long id,
			@RequestBody PolicyLeaveTypeUpdateRequestDto policyLeaveTypeUpdateRequestDto) {
		ResponseEntityDto response = policyLeaveTypeService.updatePolicyLeaveType(id, policyLeaveTypeUpdateRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Deactivate a policy leave type",
			description = "Marks an existing leave type as inactive so it is no longer available for policy creation")
	@PatchMapping("/{id}/deactivate")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> deactivatePolicyLeaveType(@PathVariable Long id) {
		ResponseEntityDto response = policyLeaveTypeService.deactivatePolicyLeaveType(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Activate a policy leave type",
			description = "Marks an existing inactive leave type as active so it is available for policy creation")
	@PatchMapping("/{id}/activate")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> activatePolicyLeaveType(@PathVariable Long id) {
		ResponseEntityDto response = policyLeaveTypeService.activatePolicyLeaveType(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
