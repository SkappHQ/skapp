package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveAvailabilityRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestUpdateDto;
import com.skapp.community.leaveplanner.service.PolicyLeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/leave/policy-leave")
@Tag(name = "Policy Leave Controller",
		description = "Viewing leave policy balances, applying for leave against a specific policy "
				+ "and acting on the leave requests raised against those policies")
public class PolicyLeaveController {

	private final PolicyLeaveService policyLeaveService;

	@Operation(summary = "Get the current user's leave policy balances",
			description = "One card per assigned policy; policies sharing a leave type are never merged")
	@GetMapping("/balances")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getCurrentUserPolicyBalances(
			@RequestParam(required = false) Integer year) {
		ResponseEntityDto response = policyLeaveService.getCurrentUserPolicyBalances(year);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get the current user's policy leave requests",
			description = "Paged, sorted and filtered feed backing the My Requests table. "
					+ "A negative size returns every matching request unpaginated, which is how the "
					+ "apply leave calendar fetches the requests already raised for a year")
	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getCurrentUserPolicyLeaveRequests(
			@Valid PolicyLeaveRequestFilterDto policyLeaveRequestFilterDto) {
		ResponseEntityDto response = policyLeaveService.getCurrentUserPolicyLeaveRequests(policyLeaveRequestFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get the policy leave requests raised by the people the current user supervises",
			description = "Paged, sorted and filtered feed backing the all leave requests table. "
					+ "The pending requests table is the same feed filtered to PENDING with a negative size")
	@GetMapping("/requests")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getSupervisedPolicyLeaveRequests(
			@Valid PolicyLeaveRequestFilterDto policyLeaveRequestFilterDto) {
		ResponseEntityDto response = policyLeaveService.getSupervisedPolicyLeaveRequests(policyLeaveRequestFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Check availability against a policy before submitting",
			description = "Real-time balance and date validation; reports the failure reason instead of erroring")
	@PostMapping("/availability")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> checkPolicyLeaveAvailability(
			@Valid @RequestBody PolicyLeaveAvailabilityRequestDto policyLeaveAvailabilityRequestDto) {
		ResponseEntityDto response = policyLeaveService.checkPolicyLeaveAvailability(policyLeaveAvailabilityRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get a single policy leave request",
			description = "Available to the employee who raised it and to anyone supervising them")
	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE','ROLE_LEAVE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getPolicyLeaveRequestById(@PathVariable Long id) {
		ResponseEntityDto response = policyLeaveService.getPolicyLeaveRequestById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update the status of a policy leave request",
			description = "The employee who raised it may cancel it while it is pending; "
					+ "anyone supervising them may approve, decline or revoke it")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE','ROLE_LEAVE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> updatePolicyLeaveRequest(@PathVariable Long id,
			@Valid @RequestBody PolicyLeaveRequestUpdateDto policyLeaveRequestUpdateDto) {
		ResponseEntityDto response = policyLeaveService.updatePolicyLeaveRequest(id, policyLeaveRequestUpdateDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Nudge the supervisors of a pending leave request",
			description = "Only the employee who raised the request may nudge, and only once a day")
	@GetMapping("/{id}/nudge")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> nudgePolicyLeaveRequestManagers(@PathVariable Long id) {
		ResponseEntityDto response = policyLeaveService.nudgePolicyLeaveRequestManagers(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Check whether a leave request can be nudged again",
			description = "Reports the last nudge and whether the daily throttle has elapsed")
	@GetMapping("/{id}/nudge/status")
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getPolicyLeaveRequestNudgeStatus(@PathVariable Long id) {
		ResponseEntityDto response = policyLeaveService.getPolicyLeaveRequestNudgeStatus(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Apply for leave against a specific leave policy",
			description = "Deducts only from the scoped policy; the balance is re-checked server side")
	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_LEAVE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> applyPolicyLeaveRequest(
			@Valid @RequestBody PolicyLeaveRequestDto policyLeaveRequestDto) {
		ResponseEntityDto response = policyLeaveService.applyPolicyLeaveRequest(policyLeaveRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

}
