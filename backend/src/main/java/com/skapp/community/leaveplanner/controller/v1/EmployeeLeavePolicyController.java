package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.AssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.EmployeeLeavePolicyFilterDto;
import com.skapp.community.leaveplanner.payload.request.UnassignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.service.EmployeeLeavePolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/leave/policy-assignments")
@Tag(name = "Employee Leave Policy Controller",
		description = "Operations related to assigning leave policies to employees")
public class EmployeeLeavePolicyController {

	private final EmployeeLeavePolicyService employeeLeavePolicyService;

	@Operation(summary = "Assign a leave policy to an employee",
			description = "Opens an effective-dated assignment window; supersedes any open window of the same leave type")
	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> assignLeavePolicy(
			@RequestBody AssignLeavePolicyRequestDto assignLeavePolicyRequestDto) {
		ResponseEntityDto response = employeeLeavePolicyService.assignLeavePolicy(assignLeavePolicyRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Unassign a leave policy from an employee",
			description = "Closes the employee's open window for the policy; 404 if no active assignment exists")
	@DeleteMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> unassignLeavePolicy(
			@RequestBody UnassignLeavePolicyRequestDto unassignLeavePolicyRequestDto) {
		ResponseEntityDto response = employeeLeavePolicyService.unassignLeavePolicy(unassignLeavePolicyRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "List an employee's active leave policy assignments",
			description = "Returns the currently active (open) policy assignment windows for the employee")
	@GetMapping("/employee/{employeeId}")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_ADMIN', 'ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getEmployeeLeavePolicies(@PathVariable Long employeeId,
			EmployeeLeavePolicyFilterDto filterDto) {
		ResponseEntityDto response = employeeLeavePolicyService.getEmployeeLeavePolicies(employeeId, filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
